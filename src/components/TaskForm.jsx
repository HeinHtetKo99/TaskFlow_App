import { useEffect, useState } from "react";
import Input from "./Input.jsx";
import Button from "./Button.jsx";

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-100 disabled:text-slate-500";

const textareaClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

export default function TaskForm({
  initial,
  members,
  isAdmin,
  onSubmit,
  onCancel,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [dueDate, setDueDate] = useState("");
  const [assigneeUid, setAssigneeUid] = useState("");

  useEffect(() => {
    setTitle(initial?.title || "");
    setDescription(initial?.description || "");
    setStatus(initial?.status || "todo");

    const d = initial?.dueDate?.toDate
      ? initial.dueDate.toDate()
      : initial?.dueDate
      ? new Date(initial.dueDate)
      : null;
    setDueDate(d ? d.toISOString().slice(0, 10) : "");
    setAssigneeUid(initial?.assigneeUid || "");
  }, [initial]);

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignee = members.find((m) => m.uid === assigneeUid);
    onSubmit({
      title,
      description,
      status,
      dueDate: dueDate || "",
      assigneeUid: isAdmin ? assigneeUid || "" : "",
      assigneeEmail: isAdmin ? assignee?.email || "" : "",
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Redesign onboarding flow"
      />

      <label className="block">
        <span className={labelClass}>Description</span>
        <textarea
          className={textareaClass}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details, context, or acceptance criteria..."
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block">
          <span className={labelClass}>Status</span>
          <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todo">Todo</option>
            <option value="doing">Doing</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </label>

        <label className="block">
          <span className={labelClass}>Due date</span>
          <input
            type="date"
            className={selectClass}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>

        <label className="block">
          <span className={labelClass}>
            Assignee {!isAdmin && <span className="font-normal text-slate-400">(admin only)</span>}
          </span>
          <select
            className={selectClass}
            value={assigneeUid}
            onChange={(e) => setAssigneeUid(e.target.value)}
            disabled={!isAdmin}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.uid} value={m.uid}>
                {m.email} ({m.role})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? "Save Changes" : "Create Task"}</Button>
      </div>
    </form>
  );
}
