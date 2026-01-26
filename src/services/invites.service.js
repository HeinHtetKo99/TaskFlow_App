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

/**
 * ✅ Admin sends invite by email
 * Creates TWO docs:
 * 1) workspaces/{wid}/invites/{autoId}
 * 2) inviteInbox/{emailLower}/items/{sameInviteId}   <-- realtime target
 */
export async function inviteMember({ workspaceId, adminUser, email }) {
  const emailClean = (email || "").trim();
  const emailLower = lower(emailClean);
  if (!emailLower) throw new Error("Email required.");

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

  // ✅ IMPORTANT: use SAME id => invitee listener will receive instantly
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

/**
 * ✅ Register.jsx may use this (one-time)
 */
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
 * ✅ REALTIME: invitee listens here (NO refresh)
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

// Backward-compatible alias (if any file still imports this name)
export function subscribePendingInvite(user, onInvite, onError) {
  return subscribeInviteInbox(
    user,
    (list) => {
      const pending = list.find((x) => x.status === "pending") || null;
      onInvite(pending);
    },
    onError
  );
}

export async function acceptInvite({ user, invite }) {
  const workspaceId = invite.workspaceId;
  const inviteId = invite.inviteId || invite.id;
  const emailLower = lower(user.email);

  // switch active workspace
  await setDoc(
    doc(db, "users", user.uid),
    { uid: user.uid, email: user.email, workspaceId, updatedAt: serverTimestamp() },
    { merge: true }
  );

  // create membership (invitee self-create)
  await setDoc(
    doc(db, "workspaces", workspaceId, "members", user.uid),
    { uid: user.uid, email: user.email, role: "member", joinedAt: serverTimestamp() },
    { merge: true }
  );

  // best effort admin tracking update
  try {
    await updateDoc(doc(db, "workspaces", workspaceId, "invites", inviteId), {
      status: "accepted",
      acceptedByUid: user.uid,
      acceptedByEmail: user.email,
      acceptedAt: serverTimestamp(),
    });
  } catch (_) {}

  // delete inbox => modal disappears immediately (realtime)
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
