import { Suspense } from "react";
import NewBookingInner from "./ui";

export default function NewBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-4 py-16 text-slate-300">
          Loading…
        </div>
      }
    >
      <NewBookingInner />
    </Suspense>
  );
}
