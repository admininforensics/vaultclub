import Link from "next/link";

export function StaffChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-amber-500/20 bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-amber-400/90">
              Club manager
            </p>
            <Link href="/staff" className="text-lg font-semibold text-white">
              Vault Club staff
            </Link>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-slate-300">
            <Link href="/staff/programmes" className="hover:text-white">
              Programmes
            </Link>
            <Link href="/staff/classes" className="hover:text-white">
              Classes
            </Link>
            <Link href="/staff/schedule" className="hover:text-white">
              Schedule
            </Link>
            <Link href="/staff/venues" className="hover:text-white">
              Venues
            </Link>
            <Link href="/" className="hover:text-white">
              Public site
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
