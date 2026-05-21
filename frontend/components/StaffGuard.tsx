"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMe, isClubAdmin } from "@/lib/auth";
import { getAccessToken } from "@/lib/api";

export function StaffGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/auth?next=/staff");
      return;
    }
    fetchMe()
      .then((me) => {
        if (isClubAdmin(me.user.role)) {
          setStatus("ok");
        } else {
          setStatus("denied");
        }
      })
      .catch(() => {
        router.replace("/auth?next=/staff");
      });
  }, [router]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-slate-400">
        Checking access…
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-2xl font-semibold">Staff access only</h1>
        <p className="mt-2 text-slate-400">
          This area is for club managers only. You must sign in on the{" "}
          <strong className="text-slate-200">website</strong> (not Django{" "}
          <code className="text-slate-300">/admin/</code>) with an account that
          has role <code className="text-emerald-200">admin</code>. Ask someone
          to run{" "}
          <code className="text-emerald-200">grant_club_admin your@email.com</code>{" "}
          on the API, then sign out and sign in again at{" "}
          <Link href="/auth?next=/staff" className="text-amber-300 hover:underline">
            /auth
          </Link>
          .
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-emerald-300 hover:text-emerald-200"
        >
          Back to site
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
