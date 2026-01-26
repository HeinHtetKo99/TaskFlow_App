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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-2xl font-black text-slate-900">Welcome back</div>
        <div className="mt-1 text-sm text-slate-600">Login to TaskFlow</div>

        {error ? <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        <form onSubmit={submit} className="mt-4 space-y-3">
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
          <Button className="w-full" disabled={busy}>
            {busy ? "Signing in..." : "Login"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          New here?{" "}
          <Link className="font-semibold text-slate-900 underline" to="/register">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
