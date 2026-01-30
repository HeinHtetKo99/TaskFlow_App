import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useWorkspace } from "../context/WorkspaceContext.jsx";
import { db } from "../firebase";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from "../hooks/useCollection.js";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import TaskForm from "../components/TaskForm.jsx";
import TaskCard from "../components/TaskCard.jsx";
import { createTask, softDeleteTask, updateTask } from "../services/tasks.service.js";

const toMs = (v) => {
  if (!v) return 0;
  if (v?.toDate) return v.toDate().getTime();
  const d = new Date(v);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

export default function Tasks() {
  const { user } = useAuth();
  const { workspaceId, members, isAdmin } = useWorkspace();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // ✅ NO orderBy => NO composite index needed
  const q = workspaceId
    ? query(
        collection(db, "workspaces", workspaceId, "tasks"),
        where("isDeleted", "==", false)
      )
    : null;

  const { data: tasksRaw, loading, error } = useCollection(q, [workspaceId]);

  // ✅ Sort in JS instead of Firestore
  const tasksSorted = useMemo(() => {
    const copy = [...tasksRaw];
    copy.sort((a, b) => toMs(b.updatedAt) - toMs(a.updatedAt));
    return copy;
  }, [tasksRaw]);

  const membersByUid = useMemo(() => {
    const map = {};
    (members || []).forEach((m) => (map[m.uid] = m));
    return map;
  }, [members]);

  // ✅ Visibility: members can only see tasks assigned to them
  // (admin still sees all tasks)
  const visibleTasks = useMemo(() => {
    if (!user?.uid) return [];
    if (isAdmin) return tasksSorted;

    return tasksSorted.filter((t) => {
      // support both uid + email (in case older tasks)
      if (t.assigneeUid) return t.assigneeUid === user.uid;
      if (t.assigneeEmail && user.email) return t.assigneeEmail === user.email;
      return false;
    });
  }, [tasksSorted, isAdmin, user?.uid, user?.email]);

  const columns = {
    todo: visibleTasks.filter((t) => t.status === "todo"),
    doing: visibleTasks.filter((t) => t.status === "doing"),
    done: visibleTasks.filter((t) => t.status === "done"),
  };

  const onCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const onEdit = (task) => {
    setEditing(task);
    setOpen(true);
  };

  const onSubmit = async (payload) => {
    if (!workspaceId) return;
    setSaving(true);
    try {
      if (!editing) {
        const finalPayload = isAdmin
          ? payload
          : { ...payload, assigneeUid: user.uid, assigneeEmail: user.email };

        await createTask({ workspaceId, actor: user, payload: finalPayload });
      } else {
        const patch = {
          title: payload.title.trim(),
          description: payload.description || "",
          status: payload.status,
          dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        };

        if (isAdmin) {
          patch.assigneeUid = payload.assigneeUid || null;
          patch.assigneeEmail = payload.assigneeEmail || null;
        }

        await updateTask({
          workspaceId,
          actor: user,
          taskId: editing.id,
          patch,
          activityMsg: `Updated task: ${patch.title}`,
        });
      }
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Only assignee can move status (even admin can't move if not assignee)
  const onMove = async (task, status) => {
    if (!workspaceId) return;
    if (!user?.uid) return;
    if (task.status === status) return;

    const isAssignee =
      (task.assigneeUid && task.assigneeUid === user.uid) ||
      (!task.assigneeUid && task.assigneeEmail && user.email && task.assigneeEmail === user.email);

    if (!isAssignee) return; // blocked: not the assignee

    await updateTask({
      workspaceId,
      actor: user,
      taskId: task.id,
      patch: { status },
      activityMsg: `Moved task: ${task.title} → ${status.toUpperCase()}`,
    });
  };

  const onTrash = async (task) => {
    if (!workspaceId) return;
    await softDeleteTask({ workspaceId, actor: user, task });
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xl font-black text-slate-900">Tasks</div>
          <div className="text-sm text-slate-600">
            Create, assign (admin), move status, trash, restore.
          </div>
        </div>
        <Button onClick={onCreate}>+ Create Task</Button>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 text-sm text-slate-600">Loading tasks...</div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {["todo", "doing", "done"].map((col) => (
          <div key={col} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-extrabold text-slate-900">
                {col === "todo" ? "Todo" : col === "doing" ? "Doing" : "Done"}
              </div>
              <div className="text-xs text-slate-500">{columns[col].length}</div>
            </div>

            <div className="space-y-3">
              {columns[col].map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  membersByUid={membersByUid}
                  isAdmin={isAdmin}
                  onMove={onMove}
                  onEdit={onEdit}
                  onTrash={onTrash}
                />
              ))}
              {columns[col].length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                  No tasks here yet.
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        title={editing ? "Edit Task" : "Create Task"}
        onClose={() => (saving ? null : setOpen(false))}
      >
        <TaskForm
          initial={editing}
          members={members}
          isAdmin={isAdmin}
          onSubmit={onSubmit}
          onCancel={() => (saving ? null : setOpen(false))}
        />
      </Modal>
    </div>
  );
}
