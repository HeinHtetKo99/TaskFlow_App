import { db } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { logActivity } from "./activity.service";

export async function createTask({ workspaceId, actor, payload }) {
  const ref = collection(db, "workspaces", workspaceId, "tasks");
  const clean = {
    title: payload.title.trim(),
    description: (payload.description || "").trim(),
    status: payload.status || "todo",
    dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
    assigneeUid: payload.assigneeUid || null,
    assigneeEmail: payload.assigneeEmail || null,
    createdByUid: actor.uid,
    createdByEmail: actor.email,
    isDeleted: false,
    deletedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(ref, clean);
  await logActivity(workspaceId, actor, `Created task: ${clean.title}`, "task");
  return docRef.id;
}

export async function updateTask({ workspaceId, actor, taskId, patch, activityMsg }) {
  const ref = doc(db, "workspaces", workspaceId, "tasks", taskId);
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() });
  if (activityMsg) await logActivity(workspaceId, actor, activityMsg, "task");
}

export async function softDeleteTask({ workspaceId, actor, task }) {
  const ref = doc(db, "workspaces", workspaceId, "tasks", task.id);
  await updateDoc(ref, { isDeleted: true, deletedAt: serverTimestamp(), updatedAt: serverTimestamp() });
  await logActivity(workspaceId, actor, `Moved to trash: ${task.title}`, "trash");
}

export async function restoreTask({ workspaceId, actor, task }) {
  const ref = doc(db, "workspaces", workspaceId, "tasks", task.id);
  await updateDoc(ref, { isDeleted: false, deletedAt: null, updatedAt: serverTimestamp() });
  await logActivity(workspaceId, actor, `Restored task: ${task.title}`, "trash");
}

export async function permanentDeleteTask({ workspaceId, actor, task }) {
  const ref = doc(db, "workspaces", workspaceId, "tasks", task.id);
  await deleteDoc(ref);
  await logActivity(workspaceId, actor, `Deleted forever: ${task.title}`, "trash");
}
