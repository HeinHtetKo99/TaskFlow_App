export default function Button({ variant = "primary", size = "md", className = "", children, ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none";

  const sizes = {
    sm: "rounded-lg px-3 py-1.5 text-xs",
    md: "rounded-xl px-5 py-2.5 text-sm",
    lg: "rounded-xl px-6 py-3 text-base",
  };

  const styles = {
    primary:
      "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:shadow-indigo-500/30 focus-visible:ring-4 focus-visible:ring-indigo-500/30",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-4 focus-visible:ring-slate-200/60",
    danger:
      "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20 hover:from-red-500 hover:to-rose-500 focus-visible:ring-4 focus-visible:ring-red-500/30",
    soft:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-4 focus-visible:ring-slate-200/60",
    outline:
      "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-slate-200/60",
  };

  return (
    <button className={`${base} ${sizes[size]} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
