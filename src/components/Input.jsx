export default function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-2 text-sm font-semibold text-slate-700">{label}</div> : null}
      <input
        className={
          "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200/60 " +
          className
        }
        {...props}
      />
    </label>
  );
}
