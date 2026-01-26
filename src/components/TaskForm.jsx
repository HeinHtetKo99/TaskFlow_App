import { useEffect, useState } from "react";
import Input from "./Input.jsx";
import Button from "./Button.jsx";

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

    const d = initial?.dueDate?.toDate ? initial.dueDate.toDate() : (initial?.dueDate ? new Date(initial.dueDate) : null);
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
      assigneeUid: isAdmin ? (assigneeUid || "") : "", // non-admin cannot assign
      assigneeEmail: isAdmin ? (assignee?.email || "") : "",
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fix login UI" />
      <label className="block">
        <div className="mb-1 text-xs font-semibold text-slate-600">Description</div>
        <textarea
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details..."
        />
      </label>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="block">
          <div className="mb-1 text-xs font-semibold text-slate-600">Status</div>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="todo">Todo</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
        </label>

        <label className="block">
          <div className="mb-1 text-xs font-semibold text-slate-600">Due date</div>
          <input
            type="date"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>

        <label className="block">
          <div className="mb-1 text-xs font-semibold text-slate-600">
            Assignee {isAdmin ? "" : "(admin only)"}
          </div>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
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

      <div className="flex gap-2 justify-end">
        <Button variant="soft" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Update Task" : "Create Task"}</Button>
      </div>
    </form>
  );
}
