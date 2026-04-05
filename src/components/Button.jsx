export default function Button({ variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300/60",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-200/60",
    danger: "bg-red-600 text-white hover:bg-red-500 focus:outline-none focus:ring-4 focus:ring-red-200/70",
    soft: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200/60",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
