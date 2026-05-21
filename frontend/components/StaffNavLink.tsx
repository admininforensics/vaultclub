"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchMe, isClubAdmin } from "@/lib/auth";
import { getAccessToken } from "@/lib/api";

export function StaffNavLink() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) return;
    fetchMe()
      .then((me) => setShow(isClubAdmin(me.user.role)))
      .catch(() => setShow(false));
  }, []);

  if (!show) return null;

  return (
    <Link
      href="/staff"
      className="font-medium text-amber-300 hover:text-amber-200"
    >
      Staff
    </Link>
  );
}
