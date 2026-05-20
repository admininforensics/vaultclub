import Link from "next/link";

export default function ShopConfirmationPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold">Thanks for your order</h1>
      <p className="mt-4 text-slate-400">
        If payment completed successfully, you will receive a confirmation email.
        Collect items at the club desk.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950"
        >
          My kids
        </Link>
        <Link
          href="/programs"
          className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold"
        >
          Browse programmes
        </Link>
      </div>
    </div>
  );
}
