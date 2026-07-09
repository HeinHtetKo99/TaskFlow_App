import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useWorkspace } from "../context/WorkspaceContext.jsx";
import Button from "./Button.jsx";
import InviteModal from "./InviteModal.jsx";
import Badge from "./Badge.jsx";
import {
  LogoIcon,
  OverviewIcon,
  TasksIcon,
  TeamIcon,
  TrashIcon,
  LogoutIcon,
} from "./Icons.jsx";

const navItems = [
  { to: "/", label: "Overview", icon: OverviewIcon },
  { to: "/tasks", label: "Tasks", icon: TasksIcon },
  { to: "/team", label: "Team", icon: TeamIcon },
  { to: "/trash", label: "Trash", icon: TrashIcon },
];

function Avatar({ email }) {
  const initial = (email?.[0] || "?").toUpperCase();
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-sm">
      {initial}
    </div>
  );
}

const NavItem = ({ to, icon: Icon, children, mobile }) => (
  <NavLink
    to={to}
    end={to === "/"}
    className={({ isActive }) =>
      mobile
        ? "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold transition " +
          (isActive ? "text-indigo-600" : "text-slate-500")
        : "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 " +
          (isActive
            ? "bg-white/10 text-white shadow-sm"
            : "text-slate-400 hover:bg-white/5 hover:text-white")
    }
  >
    {({ isActive }) => (
      <>
        <span
          className={
            mobile
              ? "flex h-8 w-8 items-center justify-center rounded-lg " +
                (isActive ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500")
              : "flex h-8 w-8 items-center justify-center rounded-lg transition-all " +
                (isActive
                  ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/30"
                  : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white")
          }
        >
          <Icon className="h-4 w-4" />
        </span>
        {children}
      </>
    )}
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
    <div className="mesh-bg min-h-screen">
      <InviteModal
        open={!!pendingInvite}
        invite={pendingInvite}
        busy={inviteBusy}
        error={inviteError}
        onAccept={acceptPendingInvite}
        onDecline={declinePendingInvite}
        onClose={closeInviteModal}
      />

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <LogoIcon className="h-7 w-7" />
            <span className="font-extrabold text-slate-900">TaskFlow</span>
          </div>
          <button
            onClick={onLogout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Sign out"
          >
            <LogoutIcon />
          </button>
        </div>
        <nav className="flex justify-around border-t border-slate-100 px-2 pb-2 pt-1">
          {navItems.map((item) => (
            <NavItem key={item.to} to={item.to} icon={item.icon} mobile>
              {item.label}
            </NavItem>
          ))}
        </nav>
      </div>

      <div className="mx-auto flex min-h-screen max-w-[1440px] gap-4 p-4 lg:p-5">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-5 flex h-[calc(100vh-2.5rem)] flex-col rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-slate-900/20">
            <div className="mb-8 flex items-center gap-3 px-1">
              <LogoIcon className="h-9 w-9" />
              <div className="min-w-0">
                <div className="text-lg font-extrabold tracking-tight text-white">TaskFlow</div>
                <div className="truncate text-xs text-slate-400">
                  {loadingWorkspace ? "Loading..." : workspace?.name || "No workspace"}
                </div>
              </div>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <NavItem key={item.to} to={item.to} icon={item.icon}>
                  {item.label}
                </NavItem>
              ))}
            </nav>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Avatar email={user?.email} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{user?.email}</div>
                  <div className="mt-1">
                    <Badge variant={role === "admin" ? "admin" : "default"}>
                      {role === "admin" ? "Admin" : "Member"}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                className="mt-3 w-full !bg-white/10 !text-slate-300 hover:!bg-white/15 hover:!text-white !shadow-none"
                variant="ghost"
                size="sm"
                onClick={onLogout}
              >
                <LogoutIcon />
                Sign out
              </Button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="min-h-[calc(100vh-2rem)] rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8 lg:min-h-[calc(100vh-2.5rem)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
