import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useWorkspace } from "../context/WorkspaceContext.jsx";
import { db } from "../firebase";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from "../hooks/useCollection.js";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Badge from "../components/Badge.jsx";
import { TrashIcon } from "../components/Icons.jsx";
import { permanentDeleteTask, restoreTask } from "../services/tasks.service.js";

const toMs = (v) => {
  if (!v) return 0;
  if (v?.toDate) return v.toDate().getTime();
  const d = new Date(v);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

export default function Trash() {
  const { user } = useAuth();
  const { workspaceId, isAdmin } = useWorkspace();
  const [busyId, setBusyId] = useState("");

  const q = workspaceId
    ? query(
        collection(db, "workspaces", workspaceId, "tasks"),
        where("isDeleted", "==", true)
      )
    : null;

  const { data: trashedRaw, loading, error } = useCollection(q, [workspaceId]);

  const trashed = useMemo(() => {
    const copy = [...trashedRaw];
    copy.sort((a, b) => toMs(b.deletedAt) - toMs(a.deletedAt));
    return copy;
  }, [trashedRaw]);

  const restore = async (t) => {
    setBusyId(t.id);
    try {
      await restoreTask({ workspaceId, actor: user, task: t });
    } finally {
      setBusyId("");
    }
  };

  const delForever = async (t) => {
    if (!isAdmin) return;
    setBusyId(t.id);
    try {
      await permanentDeleteTask({ workspaceId, actor: user, task: t });
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trash"
        subtitle="Deleted tasks are kept here safely. Restore or permanently remove them."
        badge={
          <Badge variant="warning">
            <TrashIcon className="mr-1 h-3 w-3" />
            {trashed.length} items
          </Badge>
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
          Loading trash...
        </div>
      ) : null}

      <div className="space-y-3">
        {trashed.map((t) => (
          <div
            key={t.id}
            className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <TrashIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-900">{t.title}</div>
                <div className="mt-1 text-xs text-slate-500">
                  Deleted {t.deletedAt?.toDate ? t.deletedAt.toDate().toLocaleString() : "recently"}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={busyId === t.id} onClick={() => restore(t)}>
                Restore
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={!isAdmin || busyId === t.id}
                onClick={() => delForever(t)}
                title={!isAdmin ? "Only admin can delete forever" : ""}
              >
                Delete forever
              </Button>
            </div>
          </div>
        ))}

        {!loading && trashed.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
              <TrashIcon className="h-7 w-7 text-slate-300" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600">Trash is empty</p>
            <p className="mt-1 text-xs text-slate-400">Deleted tasks will appear here for recovery.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
