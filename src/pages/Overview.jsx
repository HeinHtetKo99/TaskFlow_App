import { useAuth } from "../context/AuthContext.jsx";
import { useWorkspace } from "../context/WorkspaceContext.jsx";
import { db } from "../firebase";
import { collection, limit, orderBy, query } from "firebase/firestore";
import { useCollection } from "../hooks/useCollection.js";
import PageHeader from "../components/PageHeader.jsx";
import Badge from "../components/Badge.jsx";
import { SparklesIcon, CheckCircleIcon, ClockIcon } from "../components/Icons.jsx";

const tips = [
  "Create tasks with due dates and assignees (admin only).",
  "Move tasks through Todo → Doing → Review → Done.",
  "Trash is a safe delete — restore anytime.",
  "Admins can permanently delete from Trash.",
  "Invite teammates from the Team page.",
];

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

  const stats = [
    { label: "Your role", value: role || "—", accent: "from-indigo-500 to-violet-500" },
    { label: "Team members", value: members.length, accent: "from-sky-500 to-blue-500" },
    { label: "Recent events", value: activity.length, accent: "from-emerald-500 to-teal-500" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        subtitle={loadingWorkspace ? "Loading workspace..." : `Welcome back — here's what's happening.`}
        badge={
          <Badge variant="brand">
            <SparklesIcon className="mr-1 h-3 w-3" />
            Dashboard
          </Badge>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${s.accent} opacity-10 transition group-hover:opacity-20`} />
            <div className="relative">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</div>
              <div className="mt-2 text-3xl font-extrabold text-slate-900 capitalize">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Activity feed */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
            <p className="mt-0.5 text-xs text-slate-500">Latest updates in your workspace</p>
          </div>
          <div className="custom-scrollbar max-h-[420px] overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center gap-3 p-4 text-sm text-slate-500">
                <svg className="h-4 w-4 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading activity...
              </div>
            ) : null}
            {!loading && activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <ClockIcon className="h-6 w-6 text-slate-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">No activity yet</p>
                <p className="mt-1 text-xs text-slate-400">Actions will appear here as your team works.</p>
              </div>
            ) : null}
            <div className="space-y-2">
              {activity.map((a, i) => (
                <div
                  key={a.id}
                  className="flex gap-3 rounded-xl p-3 transition hover:bg-slate-50"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <SparklesIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{a.message}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {a.actorEmail || "System"} ·{" "}
                      {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleString() : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick guide */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">Quick Start Guide</h2>
          <p className="mt-1 text-xs text-slate-500">Everything you need to get going</p>
          <ul className="mt-5 space-y-3">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-3">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-sm text-slate-600">{tip}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl bg-indigo-50 p-4">
            <p className="text-xs text-indigo-700">
              Signed in as <span className="font-semibold">{user?.email}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
