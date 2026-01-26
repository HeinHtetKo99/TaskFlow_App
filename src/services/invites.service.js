import { db } from "../firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

function lower(s) {
  return (s || "").trim().toLowerCase();
}

export async function inviteMember({ workspaceId, adminUser, email }) {
  const emailLower = lower(email);
  if (!emailLower) throw new Error("Email required.");

  const ref = collection(db, "workspaces", workspaceId, "invites");
  await addDoc(ref, {
    email,
    emailLower,
    role: "member",
    status: "pending",
    invitedByUid: adminUser.uid,
    invitedByEmail: adminUser.email,
    createdAt: serverTimestamp(),
  });
}

export async function acceptInviteIfAny(user) {
  const emailLower = lower(user?.email);
  if (!emailLower) return null;

  // Find a pending invite in ANY workspace:
  // (simple approach: scan known workspace? Firestore can't query across subcollections without collectionGroup rules)
  // We'll use collectionGroup for invites:
  // IMPORTANT: collectionGroup requires your rules allow it via read/write controls.
  // If you don't want collectionGroup, keep invites inside workspace you know. But here we need auto-accept.

  // For simplicity in this app: we only support invites into workspaceId = inviter workspace,
  // and the invited user joins when admin sends them the workspaceId manually is hard.
  // So we do this: collectionGroup query for "invites".
  const { collectionGroup, getFirestore } = await import("firebase/firestore");
  const firestore = getFirestore(db.app);

  const q = query(
    collectionGroup(firestore, "invites"),
    where("emailLower", "==", emailLower),
    where("status", "==", "pending"),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const inviteDoc = snap.docs[0];
  const invite = inviteDoc.data();

  // workspaceId is parent of invites subcollection: workspaces/{wid}/invites/{id}
  const pathParts = inviteDoc.ref.path.split("/");
  const workspaceId = pathParts[1];

  // Add member
  const mref = doc(db, "workspaces", workspaceId, "members", user.uid);
  await setDoc(mref, {
    uid: user.uid,
    email: user.email,
    role: "member",
    joinedAt: serverTimestamp(),
  });

  // Update user workspace
  const uref = doc(db, "users", user.uid);
  await setDoc(
    uref,
    {
      uid: user.uid,
      email: user.email,
      workspaceId,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Mark invite accepted
  await updateDoc(inviteDoc.ref, {
    status: "accepted",
    acceptedByUid: user.uid,
    acceptedByEmail: user.email,
    acceptedAt: serverTimestamp(),
  });

  return workspaceId;
}
