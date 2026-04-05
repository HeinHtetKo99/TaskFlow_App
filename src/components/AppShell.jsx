import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useWorkspace } from "../context/WorkspaceContext.jsx";
import Button from "./Button.jsx";
import InviteModal from "./InviteModal.jsx";

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      "block rounded-2xl px-4 py-3 text-base font-semibold transition " +
      (isActive
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900")
    }
  >
    {children}
  </NavLink>
);

export default function AppShell() {
  const { user, logout } = useAuth();
  const {
    loadingWorkspace,
    workspace,
    role,

    pendingInvite,
    inviteBusy,
    inviteError,
    acceptPendingInvite,
    declinePendingInvite,
    closeInviteModal,
  } = useWorkspace();

  const nav = useNavigate();

  const onLogout = async () => {
    await logout();
    nav("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <InviteModal
        open={!!pendingInvite}
        invite={pendingInvite}
        busy={inviteBusy}
        error={inviteError}
        onAccept={acceptPendingInvite}
        onDecline={declinePendingInvite}
        onClose={closeInviteModal}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-6 md:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6">
            <div className="text-xl font-black tracking-tight text-slate-900">TaskFlow</div>
            <div className="mt-1 text-sm text-slate-500">
              {loadingWorkspace ? "Loading workspace..." : workspace?.name || "No workspace"}
            </div>
          </div>

          <div className="space-y-1">
            <NavItem to="/">Overview</NavItem>
            <NavItem to="/tasks">Tasks</NavItem>
            <NavItem to="/team">Team</NavItem>
            <NavItem to="/trash">Trash</NavItem>
          </div>

          <div className="mt-8 rounded-3xl bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-600">Signed in</div>
            <div className="mt-1 truncate text-base font-bold text-slate-900">{user?.email}</div>
            <div className="mt-1 text-sm text-slate-500">Role: {role || "-"}</div>

            <Button className="mt-3 w-full" variant="soft" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </aside>

        <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
