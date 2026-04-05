import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { createWorkspaceForNewUser } from "../services/workspace.service.js";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { logActivity } from "../services/activity.service.js";
import { ensureUserDoc, findPendingInvite } from "../services/invites.service.js";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // ✅ ensure users doc exists
      await ensureUserDoc(cred.user);

      // ✅ if invited, go to app -> invite modal will popup
      const inv = await findPendingInvite(cred.user);
      if (inv) {
        nav("/");
        return;
      }

      // ✅ otherwise create workspace (admin)
      const wid = await createWorkspaceForNewUser({ user: cred.user });
      await logActivity(wid, cred.user, "Workspace created. Welcome!", "info");
      nav("/");
    } catch (err) {
      setError(err.message || "Failed to register.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-slate-200/60 blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-slate-100 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-sm backdrop-blur">
          <div className="text-3xl font-black text-slate-900">Create account</div>
          <div className="mt-2 text-base text-slate-600">TaskFlow — team task tracker</div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 chars"
          />
          <Button className="w-full" disabled={busy}>
            {busy ? "Creating..." : "Register"}
          </Button>
        </form>

        <div className="mt-6 text-base text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-slate-900 underline underline-offset-4" to="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}
