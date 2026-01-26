import { useAuth } from "../context/AuthContext.jsx";
import { useWorkspace } from "../context/WorkspaceContext.jsx";
import { db } from "../firebase";
import { collection, limit, orderBy, query } from "firebase/firestore";
import { useCollection } from "../hooks/useCollection.js";

export default function Overview() {
  const { user } = useAuth();
  const { workspaceId, loadingWorkspace, members, role } = useWorkspace();

  const q = workspaceId
    ? query(
        collection(db, "workspaces", workspaceId, "activity"),
        orderBy("createdAt", "desc"),
        limit(10)
      )
    : null;

  const { data: activity, loading } = useCollection(q, [workspaceId]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xl font-black text-slate-900">Overview</div>
          <div className="text-sm text-slate-600">
            {loadingWorkspace ? "Loading..." : `You are ${role || "-"} • Members: ${members.length}`}
          </div>
        </div>
        <div className="text-xs text-slate-500">
          Signed in as <span className="font-semibold text-slate-900">{user?.email}</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-sm font-extrabold text-slate-900">Recent Activity</div>
          <div className="mt-2 space-y-2">
            {loading ? <div className="text-sm text-slate-600">Loading...</div> : null}
            {!loading && activity.length === 0 ? (
              <div className="text-sm text-slate-600">No activity yet.</div>
            ) : null}
            {activity.map((a) => (
              <div key={a.id} className="rounded-xl bg-slate-50 p-3">
                <div className="text-sm font-semibold text-slate-900">{a.message}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {a.actorEmail || "System"} •{" "}
                  {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleString() : ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-sm font-extrabold text-slate-900">How to use (HR-friendly)</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>Create tasks with due date + optional assignee (admin only assigns).</li>
            <li>Move tasks between Todo / Doing / Done.</li>
            <li>Trash is a safe delete. Restore anytime.</li>
            <li>Admin can permanently delete from Trash.</li>
            <li>Team page lets admin invite members by email.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
