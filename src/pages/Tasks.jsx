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
import PageHeader from "../components/PageHeader.jsx";
import Badge from "../components/Badge.jsx";
import { createTask, softDeleteTask, updateTask } from "../services/tasks.service.js";

const toMs = (v) => {
  if (!v) return 0;
  if (v?.toDate) return v.toDate().getTime();
  const d = new Date(v);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

const columns = [
  { key: "todo", label: "Todo", variant: "todo", accent: "border-t-slate-400" },
  { key: "doing", label: "In Progress", variant: "doing", accent: "border-t-sky-500" },
  { key: "review", label: "Review", variant: "review", accent: "border-t-violet-500" },
  { key: "done", label: "Done", variant: "done", accent: "border-t-emerald-500" },
];

export default function Tasks() {
  const { user } = useAuth();
  const { workspaceId, members, isAdmin } = useWorkspace();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const q = workspaceId
    ? query(
        collection(db, "workspaces", workspaceId, "tasks"),
        where("isDeleted", "==", false)
      )
    : null;

  const { data: tasksRaw, loading, error } = useCollection(q, [workspaceId]);

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

  const visibleTasks = useMemo(() => {
    if (!user?.uid) return [];
    if (isAdmin) return tasksSorted;

    return tasksSorted.filter((t) => {
      if (t.assigneeUid) return t.assigneeUid === user.uid;
      if (t.assigneeEmail && user.email) return t.assigneeEmail === user.email;
      return false;
    });
  }, [tasksSorted, isAdmin, user?.uid, user?.email]);

  const columnData = useMemo(() => {
    const map = {};
    columns.forEach((c) => {
      map[c.key] = visibleTasks.filter((t) => t.status === c.key);
    });
    return map;
  }, [visibleTasks]);

  const onCreate = () => {
    if (!isAdmin) return;
    setEditing(null);
    setOpen(true);
  };

  const onEdit = (task) => {
    setEditing(task);
    setOpen(true);
  };

  const onSubmit = async (payload) => {
    if (!workspaceId || !isAdmin) return;
    setSaving(true);
    try {
      if (!editing) {
        await createTask({ workspaceId, actor: user, payload });
      } else {
        const patch = {
          title: payload.title.trim(),
          description: payload.description || "",
          status: payload.status,
          dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
          assigneeUid: payload.assigneeUid || null,
          assigneeEmail: payload.assigneeEmail || null,
        };
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

  const onMove = async (task, status) => {
    if (!workspaceId || !user?.uid || task.status === status) return;

    if (!isAdmin) {
      if (task.status === "done" || status === "done") return;
      const isAssignee =
        (task.assigneeUid && task.assigneeUid === user.uid) ||
        (!task.assigneeUid && task.assigneeEmail && user.email && task.assigneeEmail === user.email);
      if (!isAssignee) return;
    }

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
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        subtitle="Admin creates and assigns. Members move to Review. Admin approves Done."
        action={
          isAdmin ? (
            <Button onClick={onCreate}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Task
            </Button>
          ) : null
        }
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-3 py-12 text-sm text-slate-500">
          <svg className="h-4 w-4 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading tasks...
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => (
          <div
            key={col.key}
            className={`flex flex-col rounded-2xl border border-slate-200/80 border-t-4 ${col.accent} bg-slate-50/50`}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{col.label}</h3>
                <Badge variant={col.variant}>{columnData[col.key]?.length || 0}</Badge>
              </div>
            </div>

            <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto px-3 pb-3" style={{ maxHeight: "calc(100vh - 280px)" }}>
              {columnData[col.key]?.map((t) => (
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
              {!loading && columnData[col.key]?.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center">
                  <p className="text-xs font-medium text-slate-400">No tasks here</p>
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
