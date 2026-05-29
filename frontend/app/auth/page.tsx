"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, setTokens } from "@/lib/api";
import { fetchMe, isClubAdmin } from "@/lib/auth";

async function redirectAfterLogin(
  router: { push: (path: string) => void },
  next: string | null
) {
  const me = await fetchMe();
  if (next && next.startsWith("/") && isClubAdmin(me.user.role)) {
    router.push(next);
    return;
  }
  if (isClubAdmin(me.user.role)) {
    router.push("/staff");
    return;
  }
  router.push("/dashboard");
}

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await apiFetch("/auth/register/", {
        method: "POST",
        body: JSON.stringify({
          first_name: fd.get("first_name"),
          last_name: fd.get("last_name"),
          email: fd.get("email"),
          password: fd.get("password"),
          whatsapp_number: fd.get("whatsapp_number") || "",
          location: fd.get("location") || "",
        }),
      });
      await onLoginAfterRegister(String(fd.get("email")), String(fd.get("password")));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function onLoginAfterRegister(email: string, password: string) {
    const tokens = await apiFetch<{ access: string; refresh: string }>(
      "/auth/login/",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
    setTokens(tokens.access, tokens.refresh);
    await redirectAfterLogin(router, next);
  }

  async function onSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const tokens = await apiFetch<{ access: string; refresh: string }>(
        "/auth/login/",
        {
          method: "POST",
          body: JSON.stringify({
            email: fd.get("email"),
            password: fd.get("password"),
          }),
        }
      );
      setTokens(tokens.access, tokens.refresh);
      await redirectAfterLogin(router, next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-slate-400">
        Parents register to book classes. Club managers with an admin role are
        sent to the{" "}
        <a href="/staff" className="text-amber-300 hover:underline">
          staff portal
        </a>{" "}
        after sign-in.
      </p>

      <div className="mt-8 flex gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
        <button
          type="button"
          className={`flex-1 rounded-full px-3 py-2 font-medium ${
            mode === "signin" ? "bg-emerald-400 text-slate-950" : "text-slate-300"
          }`}
          onClick={() => setMode("signin")}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`flex-1 rounded-full px-3 py-2 font-medium ${
            mode === "register"
              ? "bg-emerald-400 text-slate-950"
              : "text-slate-300"
          }`}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {mode === "signin" ? (
        <form className="mt-8 space-y-4" onSubmit={onSignIn}>
          <div>
            <label className="text-sm text-slate-400">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 outline-none ring-emerald-400/40 focus:ring-2"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400">Password</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 outline-none ring-emerald-400/40 focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-emerald-400 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : (
        <form className="mt-8 space-y-4" onSubmit={onRegister}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-400">First name</label>
              <input
                name="first_name"
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 outline-none ring-emerald-400/40 focus:ring-2"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Last name</label>
              <input
                name="last_name"
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 outline-none ring-emerald-400/40 focus:ring-2"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400">WhatsApp number</label>
            <input
              name="whatsapp_number"
              placeholder="+27821234567"
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 outline-none ring-emerald-400/40 focus:ring-2"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400">Your area</label>
            <input
              name="location"
              required
              placeholder="e.g. Cape Town, Sandton"
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 outline-none ring-emerald-400/40 focus:ring-2"
            />
            <p className="mt-1 text-xs text-slate-500">
              We use this to show sessions at venues near you.
            </p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 outline-none ring-emerald-400/40 focus:ring-2"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400">Password</label>
            <input
              name="password"
              type="password"
              minLength={8}
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 outline-none ring-emerald-400/40 focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-emerald-400 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-slate-400">Loading…</div>}>
      <AuthPageInner />
    </Suspense>
  );
}
