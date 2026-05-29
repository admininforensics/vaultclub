import Image from "next/image";
import Link from "next/link";

export type ProgrammeCoach = {
  id: string;
  name: string;
  bio: string;
  photo_url: string;
};

export type ProgrammeVenue = {
  id: string;
  name: string;
  address: string;
  city: string;
  image_url: string;
  maps_url: string;
  room_or_court: string;
};

function CalendarIconLink({ sportId }: { sportId: string }) {
  return (
    <Link
      href={`/schedule?sport_id=${sportId}`}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-emerald-300 transition hover:border-emerald-400/50 hover:bg-emerald-400/10"
      title="View schedule for this programme"
      aria-label="View schedule for this programme"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-5 w-5"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 2v4m8-4v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
        />
      </svg>
    </Link>
  );
}

export function ProgramDetailExtras({
  sportId,
  coaches,
  venues,
}: {
  sportId: string;
  coaches: ProgrammeCoach[];
  venues: ProgrammeVenue[];
}) {
  return (
    <>
      {coaches.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Meet the coaches</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-800">
                  {coach.photo_url ? (
                    <Image
                      src={coach.photo_url}
                      alt={coach.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-slate-500">
                      {coach.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold">{coach.name}</h3>
                    <CalendarIconLink sportId={sportId} />
                  </div>
                  {coach.bio && (
                    <p className="mt-2 text-sm text-slate-400">{coach.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {venues.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Where it happens</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="relative aspect-[16/9] bg-slate-800">
                  {venue.image_url ? (
                    <Image
                      src={venue.image_url}
                      alt={venue.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      Venue photo coming soon
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold">{venue.name}</h3>
                  {venue.room_or_court && (
                    <p className="mt-1 text-sm text-slate-400">{venue.room_or_court}</p>
                  )}
                  {(venue.address || venue.city) && (
                    <p className="mt-2 text-sm text-slate-400">
                      {[venue.address, venue.city].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {venue.maps_url && (
                    <a
                      href={venue.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200"
                    >
                      Open in Google Maps →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
