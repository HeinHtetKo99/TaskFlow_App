import { forwardRef } from "react";

const Input = forwardRef(function Input({ label, icon: Icon, className = "", ...props }, ref) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-2 text-sm font-semibold text-slate-700">{label}</div>
      ) : null}
      <div className="relative">
        {Icon ? (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
        <input
          ref={ref}
          className={
            "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 " +
            (Icon ? "pl-10 " : "") +
            className
          }
          {...props}
        />
      </div>
    </label>
  );
});

export default Input;
