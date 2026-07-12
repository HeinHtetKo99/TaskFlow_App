import { Link } from "react-router-dom";
import { LogoIcon, SparklesIcon, CheckCircleIcon } from "./Icons.jsx";

const features = [
  "Kanban boards for Todo → Done",
  "Team invites & role-based access",
  "Safe trash with restore anytime",
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="mesh-bg min-h-screen">
      <div className="flex min-h-screen">
        {/* Brand panel — hidden on mobile */}
        <div className="relative hidden w-[45%] overflow-hidden lg:flex lg:flex-col lg:justify-between mesh-bg-dark p-12 text-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
          </div>

          <div className="relative animate-fade-in-up">
            <Link to="/welcome" className="inline-flex items-center gap-3">
              <LogoIcon className="h-10 w-10" />
              <span className="text-2xl font-extrabold tracking-tight">TaskFlow</span>
            </Link>
          </div>

          <div className="relative space-y-8 animate-fade-in-up stagger-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                <SparklesIcon className="h-4 w-4 text-indigo-300" />
                Team task management, simplified
              </div>
              <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
                Ship work faster with your team
              </h2>
              <p className="mt-4 max-w-md text-lg text-slate-300">
                Organize tasks, collaborate in real-time, and keep everyone aligned — all in one beautiful workspace.
              </p>
            </div>

            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-slate-200">
                  <CheckCircleIcon className="h-5 w-5 shrink-0 text-indigo-400" />
                  <span className="text-sm font-medium">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative animate-fade-in-up stagger-3">
            <div className="glass-dark animate-float rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold">
                  TF
                </div>
                <div>
                  <div className="text-sm font-semibold">Trusted by teams</div>
                  <div className="text-xs text-slate-400">Built for clarity & speed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md animate-fade-in-up">
            {/* Mobile logo */}
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <LogoIcon className="h-9 w-9" />
              <span className="text-xl font-extrabold text-slate-900">TaskFlow</span>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
              <div className="mb-8">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
                {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
              </div>

              {children}

              {footer ? <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">{footer}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
