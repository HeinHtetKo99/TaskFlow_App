import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getFirestore,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db, getDemoAdminApp } from "../firebase";
import { ensureUserDoc } from "./invites.service.js";
import { ensureWorkspaceForUser } from "./workspace.service.js";
import { DEMO_ACCOUNTS } from "../utils/demoAccounts.js";

function isMissingUserError(error) {
  const code = error?.code || "";
  return (
    code === "auth/user-not-found" ||
    code === "auth/invalid-credential" ||
    code === "auth/invalid-login-credentials"
  );
}

async function ensureAuthUser(authInstance, email, password) {
  try {
    return await signInWithEmailAndPassword(authInstance, email, password);
  } catch (err) {
    if (!isMissingUserError(err)) throw err;

    try {
      return await createUserWithEmailAndPassword(authInstance, email, password);
    } catch (createErr) {
      if (createErr?.code === "auth/email-already-in-use") {
        throw Object.assign(new Error("Demo password does not match the existing Firebase user."), {
          code: "auth/wrong-password",
        });
      }
      throw createErr;
    }
  }
}

async function ensureUserDocOn(dbInstance, user) {
  if (!user?.uid) return;
  await setDoc(
    doc(dbInstance, "users", user.uid),
    { uid: user.uid, email: user.email || null, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

async function ensureWorkspaceForUserOn(dbInstance, user) {
  if (!user?.uid) throw new Error("No auth user");

  const userRef = doc(dbInstance, "users", user.uid);

  return runTransaction(dbInstance, async (tx) => {
    const userSnap = await tx.get(userRef);
    const userData = userSnap.exists() ? userSnap.data() : null;
    if (userData?.workspaceId) return userData.workspaceId;

    const wsRef = doc(collection(dbInstance, "workspaces"));
    tx.set(wsRef, {
      name: "Demo Workspace",
      ownerUid: user.uid,
      ownerEmail: user.email || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    tx.set(doc(dbInstance, "workspaces", wsRef.id, "members", user.uid), {
      uid: user.uid,
      email: user.email || null,
      role: "admin",
      joinedAt: serverTimestamp(),
    });

    tx.set(
      userRef,
      {
        uid: user.uid,
        email: user.email || null,
        workspaceId: wsRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return wsRef.id;
  });
}

async function attachMemberToWorkspace(user, workspaceId) {
  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      email: user.email || null,
      workspaceId,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(
    doc(db, "workspaces", workspaceId, "members", user.uid),
    {
      uid: user.uid,
      email: user.email || null,
      role: "member",
      joinedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

function accountById(id) {
  const account = DEMO_ACCOUNTS.find((a) => a.id === id);
  if (!account?.email || !account?.password) {
    throw Object.assign(new Error("Demo accounts are not configured."), {
      code: "auth/missing-email",
    });
  }
  return account;
}

/**
 * Resolve the shared demo workspace using a secondary Firebase app so the
 * primary AuthContext / PublicOnly route never briefly sees the admin user.
 */
async function resolveDemoWorkspaceId(admin) {
  const adminApp = getDemoAdminApp();
  const adminAuth = getAuth(adminApp);
  const adminDb = getFirestore(adminApp);

  try {
    const adminCred = await ensureAuthUser(adminAuth, admin.email, admin.password);
    await ensureUserDocOn(adminDb, adminCred.user);
    return await ensureWorkspaceForUserOn(adminDb, adminCred.user);
  } finally {
    if (adminAuth.currentUser) {
      await signOut(adminAuth);
    }
  }
}

/**
 * Sign in as a demo role. Creates the Firebase user (and workspace links)
 * on first use so one-click demo login works without manual console setup.
 */
export async function signInDemoAccount(accountId) {
  const target = accountById(accountId);
  const admin = accountById("admin");

  if (target.id === "admin") {
    if (auth.currentUser) {
      await signOut(auth);
    }
    const cred = await ensureAuthUser(auth, target.email, target.password);
    await ensureUserDoc(cred.user);
    await ensureWorkspaceForUser(cred.user);
    return cred.user;
  }

  // Bootstrap admin workspace off-session, then sign in only as member.
  const workspaceId = await resolveDemoWorkspaceId(admin);

  if (auth.currentUser) {
    await signOut(auth);
  }

  const memberCred = await ensureAuthUser(auth, target.email, target.password);
  await ensureUserDoc(memberCred.user);
  await attachMemberToWorkspace(memberCred.user, workspaceId);
  return memberCred.user;
}
