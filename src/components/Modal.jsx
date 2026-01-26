export default function Modal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={() => onClose?.()}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="text-sm font-extrabold text-slate-900">{title}</div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
