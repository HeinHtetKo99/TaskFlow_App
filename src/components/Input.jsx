export default function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-xs font-semibold text-slate-600">{label}</div> : null}
      <input
        className={
          "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 " +
          className
        }
        {...props}
      />
    </label>
  );
}
