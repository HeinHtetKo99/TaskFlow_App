import { db } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

const lower = (s) => (s || "").trim().toLowerCase();

export async function ensureUserDoc(user) {
  if (!user?.uid) return;
  await setDoc(
    doc(db, "users", user.uid),
    { uid: user.uid, email: user.email || null, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function inviteMember({ workspaceId, adminUser, email }) {
  const emailClean = (email || "").trim();
  const emailLower = lower(emailClean);
  if (!emailLower) throw new Error("Email required.");

  // admin tracking
  const wInvitesRef = collection(db, "workspaces", workspaceId, "invites");
  const inviteDocRef = await addDoc(wInvitesRef, {
    email: emailClean,
    emailLower,
    status: "pending",
    workspaceId,
    invitedByUid: adminUser.uid,
    invitedByEmail: adminUser.email,
    createdAt: serverTimestamp(),
  });

  // invitee inbox (THIS is what realtime listens to)
  await setDoc(doc(db, "inviteInbox", emailLower, "items", inviteDocRef.id), {
    inviteId: inviteDocRef.id,
    workspaceId,
    status: "pending",
    invitedByUid: adminUser.uid,
    invitedByEmail: adminUser.email,
    email: emailClean,
    emailLower,
    createdAt: serverTimestamp(),
  });

  return inviteDocRef.id;
}

export async function findPendingInvite(user) {
  const emailLower = lower(user?.email);
  if (!emailLower) return null;

  const itemsRef = collection(db, "inviteInbox", emailLower, "items");
  const q = query(itemsRef, where("status", "==", "pending"), limit(1));
  const snap = await getDocs(q);

  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

/**
 * ✅ Real-time inbox listener (NO refresh)
 * NOTE: no query filters => fewer edge cases (works instantly)
 */
export function subscribeInviteInbox(user, onInvites, onError) {
  const emailLower = lower(user?.email);
  if (!emailLower) return () => {};

  const itemsRef = collection(db, "inviteInbox", emailLower, "items");

  return onSnapshot(
    itemsRef,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onInvites(list);
    },
    (err) => onError?.(err)
  );
}

export async function acceptInvite({ user, invite }) {
  const workspaceId = invite.workspaceId;
  const inviteId = invite.inviteId || invite.id;
  const emailLower = lower(user.email);

  await setDoc(
    doc(db, "users", user.uid),
    { uid: user.uid, email: user.email, workspaceId, updatedAt: serverTimestamp() },
    { merge: true }
  );

  await setDoc(
    doc(db, "workspaces", workspaceId, "members", user.uid),
    { uid: user.uid, email: user.email, role: "member", joinedAt: serverTimestamp() },
    { merge: true }
  );

  // best effort
  try {
    await updateDoc(doc(db, "workspaces", workspaceId, "invites", inviteId), {
      status: "accepted",
      acceptedByUid: user.uid,
      acceptedByEmail: user.email,
      acceptedAt: serverTimestamp(),
    });
  } catch (_) {}

  // remove inbox => modal disappears instantly
  await deleteDoc(doc(db, "inviteInbox", emailLower, "items", inviteId));

  return workspaceId;
}

export async function declineInvite({ user, invite }) {
  const workspaceId = invite.workspaceId;
  const inviteId = invite.inviteId || invite.id;
  const emailLower = lower(user.email);

  try {
    await updateDoc(doc(db, "workspaces", workspaceId, "invites", inviteId), {
      status: "declined",
      declinedByUid: user.uid,
      declinedByEmail: user.email,
      declinedAt: serverTimestamp(),
    });
  } catch (_) {}

  await deleteDoc(doc(db, "inviteInbox", emailLower, "items", inviteId));
}
