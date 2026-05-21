import Link from "next/link";
import { AuthNavButton } from "@/components/AuthNavButton";

export function SiteNav() {
  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Vault Club
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
          <Link href="/programs/sports" className="hover:text-white">
            Sports
          </Link>
          <Link href="/programs/music" className="hover:text-white">
            Music
          </Link>
          <Link href="/programs/tutoring" className="hover:text-white">
            Tutoring
          </Link>
          <Link href="/schedule" className="hover:text-white">
            Schedule
          </Link>
          <Link href="/about" className="hover:text-white">
            About
          </Link>
          <Link href="/dashboard" className="hover:text-white">
            My kids
          </Link>
          <AuthNavButton />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 py-10 text-sm text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
        <p>Vault Club — sports, music and tutoring for kids who go all-in.</p>
        <p>Questions? Reach us on WhatsApp after you register.</p>
      </div>
    </footer>
  );
}
