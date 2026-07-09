import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { createWorkspaceForNewUser } from "../services/workspace.service.js";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import AuthLayout from "../components/AuthLayout.jsx";
import { MailIcon, LockIcon } from "../components/Icons.jsx";
import { logActivity } from "../services/activity.service.js";
import { ensureUserDoc, findPendingInvite } from "../services/invites.service.js";
import {
  getRegisterErrorMessage,
  validateEmail,
  validatePassword,
} from "../utils/authErrors.js";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const passwordError = validatePassword(password, { forRegister: true });
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await ensureUserDoc(cred.user);

      const inv = await findPendingInvite(cred.user);
      if (inv) {
        nav("/");
        return;
      }

      const wid = await createWorkspaceForNewUser(cred.user);
      await logActivity(wid, cred.user, "Workspace created. Welcome!", "info");
      nav("/");
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organizing tasks with your team in seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link className="font-semibold text-indigo-600 hover:text-indigo-500" to="/login">
            Sign in
          </Link>
        </>
      }
    >
      {error ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      ) : null}

      <form onSubmit={submit} className="space-y-5">
        <Input
          label="Email address"
          icon={MailIcon}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
        <Input
          label="Password"
          type="password"
          icon={LockIcon}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 6 characters"
        />
        <Button className="w-full" size="lg" disabled={busy}>
          {busy ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
