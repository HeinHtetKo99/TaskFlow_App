import Modal from "./Modal.jsx";
import Button from "./Button.jsx";
import { TeamIcon } from "./Icons.jsx";

export default function InviteModal({
  open,
  invite,
  busy,
  error,
  onAccept,
  onDecline,
  onClose,
}) {
  return (
    <Modal open={open} title="Workspace Invitation" onClose={onClose}>
      <div className="space-y-5">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="flex items-start gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md">
            <TeamIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-700">
              You've been invited by{" "}
              <span className="font-bold text-slate-900">{invite?.invitedByEmail || "an admin"}</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Accept to join their workspace and collaborate on shared tasks instantly.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={onDecline}>
            Decline
          </Button>
          <Button disabled={busy} onClick={onAccept}>
            {busy ? "Joining..." : "Accept & Join"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
