"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/components/admin/api";
import { Field } from "@/components/admin/ui";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/api/admin/auth/login", { method: "POST", body: { email, password } });
      router.replace("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-10 flex flex-col gap-6" noValidate>
      <Field label="Email" htmlFor="admin-email">
        <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="a-input" />
      </Field>
      <Field label="Password" htmlFor="admin-password">
        <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="a-input" />
      </Field>
      <div aria-live="polite" className="min-h-[22px]">
        {error ? (
          <p role="alert" className="text-[13px] text-danger">
            {error}
          </p>
        ) : null}
      </div>
      <button type="submit" disabled={busy || !email || !password} className="a-btn-primary">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
