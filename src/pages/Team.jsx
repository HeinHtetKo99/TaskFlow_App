import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useWorkspace } from "../context/WorkspaceContext.jsx";
import { inviteMember } from "../services/invites.service.js";
import PageHeader from "../components/PageHeader.jsx";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import Badge from "../components/Badge.jsx";
import { MailIcon, TeamIcon } from "../components/Icons.jsx";

function MemberAvatar({ email }) {
  const initial = (email?.[0] || "?").toUpperCase();
  const colors = [
    "from-indigo-500 to-violet-500",
    "from-sky-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
  ];
  const idx = (email?.charCodeAt(0) || 0) % colors.length;
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colors[idx]} text-sm font-bold text-white shadow-sm`}
    >
      {initial}
    </div>
  );
}

export default function Team() {
  const { user } = useAuth();
  const { workspaceId, isAdmin, members = [], loadingWorkspace } = useWorkspace();

  const emailRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const onInvite = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!isAdmin) {
      setErr("Only admin can invite members.");
      return;
    }
    if (!workspaceId) {
      setErr("No workspace found.");
      return;
    }

    const email = (emailRef.current?.value || "").trim();
    if (!email) {
      setErr("Enter an email.");
      return;
    }

    setBusy(true);
    try {
      await inviteMember({ workspaceId, adminUser: user, email });
      setMsg(`Invite sent to ${email}`);
      if (emailRef.current) emailRef.current.value = "";
    } catch (e2) {
      setErr(e2?.message || "Failed to send invite.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Team"
        subtitle="Manage your workspace members and send invitations."
        badge={
          <Badge variant="brand">
            <TeamIcon className="mr-1 h-3 w-3" />
            {members.length} {members.length === 1 ? "member" : "members"}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Members list */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-bold text-slate-900">Workspace Members</h2>
            <p className="mt-0.5 text-xs text-slate-500">People with access to this workspace</p>
          </div>
          <div className="divide-y divide-slate-100 p-2">
            {loadingWorkspace ? (
              <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
                <svg className="h-4 w-4 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading team members...
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <TeamIcon className="h-6 w-6 text-slate-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">No members yet</p>
                <p className="mt-1 text-xs text-slate-400">Invite someone to get started.</p>
              </div>
            ) : (
              members.map((m) => (
                <div
                  key={m.uid || m.id || m.email}
                  className="flex items-center justify-between rounded-xl p-4 transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <MemberAvatar email={m.email} />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{m.email}</div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        Joined as {m.role || "member"}
                      </div>
                    </div>
                  </div>
                  <Badge variant={m.role === "admin" ? "admin" : "brand"}>
                    {m.role === "admin" ? "Admin" : "Member"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invite form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-indigo-50/50 to-violet-50/30 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Invite a teammate</h2>
            <p className="mt-1 text-xs text-slate-500">
              They'll receive an instant invite when they sign in.
            </p>

            {msg ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {msg}
              </div>
            ) : null}
            {err ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>
            ) : null}

            <form onSubmit={onInvite} className="mt-5 space-y-4">
              <Input
                ref={emailRef}
                type="email"
                label="Email address"
                icon={MailIcon}
                placeholder="colleague@company.com"
                disabled={!isAdmin}
              />

              <Button className="w-full" disabled={busy || !isAdmin}>
                {busy ? "Sending invite..." : "Send Invitation"}
              </Button>

              {!isAdmin ? (
                <p className="text-center text-xs text-slate-500">Only admins can invite new members.</p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
