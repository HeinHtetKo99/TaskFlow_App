import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useWorkspace } from "../context/WorkspaceContext.jsx";
import { db } from "../firebase";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from "../hooks/useCollection.js";
import Button from "../components/Button.jsx";
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

  // ✅ NO orderBy => NO composite index needed
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
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xl font-black text-slate-900">Trash</div>
          <div className="text-sm text-slate-600">
            Restore tasks or delete forever (admin only).
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 text-sm text-slate-600">Loading trash...</div>
      ) : null}

      <div className="mt-6 space-y-3">
        {trashed.map((t) => (
          <div key={t.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold text-slate-900">
                  {t.title}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Deleted: {t.deletedAt?.toDate ? t.deletedAt.toDate().toLocaleString() : ""}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="soft" disabled={busyId === t.id} onClick={() => restore(t)}>
                  Restore
                </Button>
                <Button
                  variant="danger"
                  disabled={!isAdmin || busyId === t.id}
                  onClick={() => delForever(t)}
                  title={!isAdmin ? "Only admin can delete forever" : ""}
                >
                  Delete forever
                </Button>
              </div>
            </div>
          </div>
        ))}

        {!loading && trashed.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
            Trash is empty.
          </div>
        ) : null}
      </div>
    </div>
  );
}
