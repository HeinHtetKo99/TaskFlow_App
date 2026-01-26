export default function Button({ variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-900",
    danger: "bg-red-600 text-white hover:bg-red-500",
    soft: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
