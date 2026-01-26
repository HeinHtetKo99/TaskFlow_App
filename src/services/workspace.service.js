import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

export async function ensureWorkspaceForUser(user) {
  if (!user?.uid) throw new Error("No auth user");

  const userRef = doc(db, "users", user.uid);

  const wid = await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    const userData = userSnap.exists() ? userSnap.data() : null;

    // ✅ already linked
    if (userData?.workspaceId) return userData.workspaceId;

    // ✅ create workspace
    const wsRef = doc(collection(db, "workspaces"));
    tx.set(wsRef, {
      name: "My Workspace",
      ownerUid: user.uid,
      ownerEmail: user.email || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // ✅ owner becomes admin
    const memberRef = doc(db, "workspaces", wsRef.id, "members", user.uid);
    tx.set(memberRef, {
      uid: user.uid,
      email: user.email || null,
      role: "admin",
      joinedAt: serverTimestamp(),
    });

    // ✅ link user -> workspace
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

  return wid;
}

export async function getUserWorkspaceId(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().workspaceId || null : null;
}

/**
 * ✅ Compatibility export (your Register.jsx expects this name)
 * It creates workspace + admin membership for new user.
 */
export async function createWorkspaceForNewUser(user) {
  return ensureWorkspaceForUser(user);
}
