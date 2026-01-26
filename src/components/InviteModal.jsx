import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

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
      <div className="space-y-3">
        {error ? (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          You were invited by{" "}
          <span className="font-bold text-slate-900">
            {invite?.invitedByEmail || "Admin"}
          </span>
          .
          <div className="mt-1 text-xs text-slate-500">
            Accept to join their workspace and see their tasks.
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="soft" disabled={busy} onClick={onDecline}>
            Decline
          </Button>
          <Button disabled={busy} onClick={onAccept}>
            {busy ? "Accepting..." : "Accept & Join"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
