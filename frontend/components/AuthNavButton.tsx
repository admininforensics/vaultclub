"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { clearTokens, getAccessToken } from "@/lib/api";

export function AuthNavButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  const syncAuth = useCallback(() => {
    setAuthed(!!getAccessToken());
  }, []);

  useEffect(() => {
    syncAuth();
    window.addEventListener("auth-changed", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("auth-changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, [syncAuth]);

  useEffect(() => {
    syncAuth();
  }, [pathname, syncAuth]);

  if (authed) {
    return (
      <button
        type="button"
        onClick={() => {
          clearTokens();
          router.push("/");
        }}
        className="rounded-full border border-white/15 px-4 py-1.5 font-medium text-slate-200 hover:border-white/35"
      >
        Sign out
      </button>
    );
  }

  return (
    <Link
      href="/auth"
      className="rounded-full bg-emerald-400 px-4 py-1.5 font-medium text-slate-950 hover:bg-emerald-300"
    >
      Sign in
    </Link>
  );
}
