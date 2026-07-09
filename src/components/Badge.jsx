const variants = {
  default: "bg-slate-100 text-slate-700 ring-slate-200/80",
  brand: "bg-indigo-50 text-indigo-700 ring-indigo-200/80",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
  warning: "bg-amber-50 text-amber-700 ring-amber-200/80",
  danger: "bg-red-50 text-red-700 ring-red-200/80",
  todo: "bg-slate-100 text-slate-600 ring-slate-200/80",
  doing: "bg-sky-50 text-sky-700 ring-sky-200/80",
  review: "bg-violet-50 text-violet-700 ring-violet-200/80",
  done: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
  admin: "bg-gradient-to-r from-indigo-500 to-violet-500 text-white ring-transparent",
};

export default function Badge({ variant = "default", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
