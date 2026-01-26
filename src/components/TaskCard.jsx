import Button from "./Button.jsx";

export default function TaskCard({ task, membersByUid, isAdmin, onMove, onEdit, onTrash }) {
  const assigneeName =
    task.assigneeUid && membersByUid[task.assigneeUid]
      ? membersByUid[task.assigneeUid].email
      : task.assigneeEmail || "Unassigned";

  const due = task.dueDate?.toDate ? task.dueDate.toDate() : (task.dueDate ? new Date(task.dueDate) : null);
  const dueText = due ? due.toLocaleDateString() : "No due date";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold text-slate-900">{task.title}</div>
          {task.description ? (
            <div className="mt-1 line-clamp-2 text-xs text-slate-600">{task.description}</div>
          ) : null}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" onClick={() => onEdit(task)}>Edit</Button>
          <Button variant="danger" onClick={() => onTrash(task)}>Trash</Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="rounded-xl bg-slate-50 px-2 py-1 text-slate-700">
          Assignee: <span className="font-semibold">{assigneeName}</span>
        </div>
        <div className="rounded-xl bg-slate-50 px-2 py-1 text-slate-700">
          Due: <span className="font-semibold">{dueText}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="soft" onClick={() => onMove(task, "todo")}>Todo</Button>
        <Button variant="soft" onClick={() => onMove(task, "doing")}>Doing</Button>
        <Button variant="soft" onClick={() => onMove(task, "done")}>Done</Button>
        {!isAdmin ? (
          <div className="ml-auto text-xs text-slate-500 self-center">Members can move status. Admin assigns.</div>
        ) : null}
      </div>
    </div>
  );
}
