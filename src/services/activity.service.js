import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function logActivity(workspaceId, actor, message, type = "info") {
  if (!workspaceId) return;
  const ref = collection(db, "workspaces", workspaceId, "activity");
  await addDoc(ref, {
    type,
    message,
    actorUid: actor?.uid || null,
    actorEmail: actor?.email || null,
    createdAt: serverTimestamp(),
  });
}
