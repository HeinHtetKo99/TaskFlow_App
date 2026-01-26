import Button from "./Button.jsx";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="text-sm font-bold text-slate-900">{title}</div>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
