import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useWorkspace } from "../context/WorkspaceContext.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { inviteMember } from "../services/invites.service.js";
import { logActivity } from "../services/activity.service.js";

export default function Team() {
  const { user } = useAuth();
  const { workspaceId, members, isAdmin } = useWorkspace();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const sendInvite = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setMsg("");
    setBusy(true);
    try {
      await inviteMember({ workspaceId, adminUser: user, email });
      await logActivity(workspaceId, user, `Invited member: ${email}`, "team");
      setEmail("");
      setMsg("Invite sent. Tell them to login/register with that email.");
    } catch (err) {
      setMsg(err.message || "Failed to invite.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xl font-black text-slate-900">Team</div>
          <div className="text-sm text-slate-600">Admin can invite members by email.</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-sm font-extrabold text-slate-900">Members</div>
          <div className="mt-3 space-y-2">
            {members.map((m) => (
              <div key={m.uid} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-900">{m.email}</div>
                  <div className="text-xs text-slate-500">Role: {m.role}</div>
                </div>
                <div className="rounded-xl bg-white px-2 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                  {m.uid === user?.uid ? "You" : "Member"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-sm font-extrabold text-slate-900">Invite member</div>
          {!isAdmin ? (
            <div className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              Only admin can invite and assign tasks.
            </div>
          ) : (
            <form onSubmit={sendInvite} className="mt-3 space-y-3">
              <Input
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
              />
              <Button className="w-full" disabled={busy}>
                {busy ? "Sending..." : "Send Invite"}
              </Button>
            </form>
          )}

          {msg ? <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{msg}</div> : null}
        </div>
      </div>
    </div>
  );
}
