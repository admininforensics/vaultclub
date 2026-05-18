export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold">About Vault Club</h1>
      <p className="mt-6 text-slate-300">
        Vault Club is a multi-sport kids club built around a single weekly rhythm:
        discovery, progression, and coaches who care about confidence as much as
        technique.
      </p>
      <p className="mt-4 text-slate-300">
        Parents manage profiles for their children, browse a live schedule with
        transparent capacity, and pay online. Behind the scenes we keep booking
        integrity tight — capacity checks are transactional and confirmations follow
        verified payment events.
      </p>
      <p className="mt-4 text-slate-400 text-sm">
        This deployment is an MVP: WhatsApp is used manually for now, with richer
        messaging hooks planned next.
      </p>
    </div>
  );
}
