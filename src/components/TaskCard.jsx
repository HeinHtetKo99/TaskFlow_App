import Button from "./Button.jsx";
import Badge from "./Badge.jsx";
import { UserIcon, ClockIcon } from "./Icons.jsx";

const statusVariant = {
  todo: "todo",
  doing: "doing",
  review: "review",
  done: "done",
};

export default function TaskCard({
  task,
  membersByUid,
  isAdmin,
  onMove,
  onEdit,
  onTrash,
}) {
  const assigneeName =
    task.assigneeUid && membersByUid[task.assigneeUid]
      ? membersByUid[task.assigneeUid].email
      : task.assigneeEmail || "Unassigned";

  const due = task.dueDate?.toDate
    ? task.dueDate.toDate()
    : task.dueDate
    ? new Date(task.dueDate)
    : null;

  const dueText = due ? due.toLocaleDateString() : "No due date";
  const isOverdue = due && due < new Date() && task.status !== "done";

  const moves = [
    { status: "todo", label: "Todo" },
    { status: "doing", label: "Doing" },
    { status: "review", label: "Review" },
    ...(isAdmin ? [{ status: "done", label: "Done" }] : []),
  ];

  return (
    <div className="group rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-bold text-slate-900">{task.title}</h4>
            <Badge variant={statusVariant[task.status] || "default"} className="shrink-0">
              {task.status}
            </Badge>
          </div>
          {task.description ? (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
              {task.description}
            </p>
          ) : null}
        </div>

        {isAdmin ? (
          <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={() => onEdit(task)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              title="Edit"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
            </button>
            <button
              onClick={() => onTrash(task)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
              title="Move to trash"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
          <UserIcon className="h-3 w-3 text-slate-400" />
          <span className="max-w-[120px] truncate font-medium">{assigneeName}</span>
        </span>
        <span
          className={
            "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] " +
            (isOverdue ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600")
          }
        >
          <ClockIcon className="h-3 w-3" />
          <span className="font-medium">{dueText}</span>
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {moves.map((m) => (
          <button
            key={m.status}
            onClick={() => onMove(task, m.status)}
            disabled={task.status === m.status}
            className={
              "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition " +
              (task.status === m.status
                ? "bg-indigo-100 text-indigo-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200")
            }
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
