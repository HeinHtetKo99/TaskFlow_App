import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";

export default function Login() {
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
      await signInWithEmailAndPassword(auth, email.trim(), password);
      nav("/");
    } catch (err) {
      setError(err.message || "Failed to login.");
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
          <div className="text-3xl font-black text-slate-900">Welcome back</div>
          <div className="mt-2 text-base text-slate-600">Login to TaskFlow</div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input
              autoComplete="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
          <Button className="w-full" disabled={busy}>
            {busy ? "Signing in..." : "Login"}
          </Button>
          </form>

          <div className="mt-6 text-base text-slate-600">
            New here?{" "}
            <Link className="font-semibold text-slate-900 underline underline-offset-4" to="/register">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
