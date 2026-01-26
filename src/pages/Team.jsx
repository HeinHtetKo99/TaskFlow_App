import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useWorkspace } from "../context/WorkspaceContext.jsx";
import { inviteMember } from "../services/invites.service.js";

export default function Team() {
  const { user } = useAuth();
  const { workspaceId, isAdmin, members = [] } = useWorkspace();

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
      setMsg(`Invite sent to ${email} (should popup instantly for them if logged in).`);
      if (emailRef.current) emailRef.current.value = "";
    } catch (e2) {
      setErr(e2?.message || "Failed to send invite (rules/permissions).");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-black text-slate-900">Team</div>
        <div className="text-sm text-slate-500">Admin can invite members by email.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-extrabold text-slate-900 mb-3">Members</div>

          <div className="space-y-2">
            {members.length === 0 ? (
              <div className="text-sm text-slate-500">No members yet.</div>
            ) : (
              members.map((m) => (
                <div
                  key={m.uid || m.id || m.email}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900">{m.email}</div>
                    <div className="text-xs text-slate-500">Role: {m.role || "member"}</div>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                    {m.role === "admin" ? "Admin" : "Member"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-extrabold text-slate-900 mb-3">Invite member</div>

          {msg ? <div className="mb-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{msg}</div> : null}
          {err ? <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}

          <form onSubmit={onInvite} className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Email</div>
              <input
                ref={emailRef}
                type="email"
                placeholder="friend@example.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <button
              type="submit"
              disabled={busy || !isAdmin}
              className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {busy ? "Sending..." : "Send Invite"}
            </button>

            {!isAdmin ? (
              <div className="text-xs text-slate-500">Only admin can invite.</div>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
