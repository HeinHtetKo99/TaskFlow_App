import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import { getLoginErrorMessage } from "../utils/authErrors.js";
import { DEMO_ACCOUNTS, demoAccountsConfigured } from "../utils/demoAccounts.js";
import { signInDemoAccount } from "../services/demoLogin.service.js";

export default function Welcome() {
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const signInAs = async (account) => {
    setError("");

    if (!account.email || !account.password) {
      setError("Demo accounts are not configured. Add VITE_DEMO_* values to your .env file.");
      return;
    }

    setBusyId(account.id);
    try {
      await signInDemoAccount(account.id);
      nav("/");
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setBusyId("");
    }
  };

  return (
    <AuthLayout
      title="Welcome to TaskFlow"
      subtitle="Pick a demo role to explore the app, or continue with your own account."
    >
      {error ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      ) : null}

      {!demoAccountsConfigured() ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Demo logins need `VITE_DEMO_*` credentials in `.env`.
        </div>
      ) : null}

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Try a demo</p>

        {DEMO_ACCOUNTS.map((account) => {
          const busy = busyId === account.id;
          const disabled = Boolean(busyId);

          return (
            <button
              key={account.id}
              type="button"
              disabled={disabled || !account.email || !account.password}
              onClick={() => signInAs(account)}
              className="group w-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-md hover:shadow-indigo-100/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:shadow-none"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${account.accent} text-sm font-bold text-white shadow-sm`}
                >
                  {account.role.slice(0, 1)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900">{account.role}</span>
                    <Badge variant={account.id === "admin" ? "admin" : "brand"}>
                      {account.id === "admin" ? "Owner" : "Team"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{account.description}</p>
                  {account.email ? (
                    <p className="mt-2 truncate font-mono text-xs text-slate-400">{account.email}</p>
                  ) : null}
                </div>

                <span className="hidden shrink-0 self-center text-sm font-semibold text-indigo-600 sm:inline group-hover:text-indigo-500">
                  {busy ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Continue →"
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 border-t border-slate-100 pt-6">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
          Or use your account
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="w-full" size="md" onClick={() => nav("/login")}>
            Sign in
          </Button>
          <Button type="button" className="w-full" size="md" onClick={() => nav("/register")}>
            Create account
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
