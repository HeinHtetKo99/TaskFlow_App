import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function createWorkspaceForNewUser({ user }) {
  const workspaceId = user.uid; // simple & stable
  const wref = doc(db, "workspaces", workspaceId);
  const uref = doc(db, "users", user.uid);
  const mref = doc(db, "workspaces", workspaceId, "members", user.uid);

  await setDoc(wref, {
    name: "My Workspace",
    ownerUid: user.uid,
    ownerEmail: user.email,
    createdAt: serverTimestamp(),
  });

  await setDoc(uref, {
    uid: user.uid,
    email: user.email,
    workspaceId,
    createdAt: serverTimestamp(),
  });

  await setDoc(mref, {
    uid: user.uid,
    email: user.email,
    role: "admin",
    joinedAt: serverTimestamp(),
  });

  return workspaceId;
}
