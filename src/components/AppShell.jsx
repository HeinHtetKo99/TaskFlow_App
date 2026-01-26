import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useWorkspace } from "../context/WorkspaceContext.jsx";
import Button from "./Button.jsx";

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      "block rounded-xl px-3 py-2 text-sm font-semibold transition " +
      (isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100")
    }
  >
    {children}
  </NavLink>
);

export default function AppShell() {
  const { user, logout } = useAuth();
  const { loadingWorkspace, workspace, role } = useWorkspace();
  const nav = useNavigate();

  const onLogout = async () => {
    await logout();
    nav("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 p-4 md:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-4">
            <div className="text-lg font-black text-slate-900">TaskFlow</div>
            <div className="text-xs text-slate-500">
              {loadingWorkspace ? "Loading workspace..." : workspace?.name || "No workspace"}
            </div>
          </div>

          <div className="space-y-1">
            <NavItem to="/">Overview</NavItem>
            <NavItem to="/tasks">Tasks</NavItem>
            <NavItem to="/team">Team</NavItem>
            <NavItem to="/trash">Trash</NavItem>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-600">Signed in</div>
            <div className="truncate text-sm font-bold text-slate-900">{user?.email}</div>
            <div className="mt-1 text-xs text-slate-500">Role: {role || "-"}</div>
            <Button className="mt-3 w-full" variant="soft" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </aside>

        <main className="rounded-2xl border border-slate-200 bg-white p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
