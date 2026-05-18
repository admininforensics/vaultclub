import { Suspense } from "react";
import BookingConfirmationInner from "./ui";

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-4 py-16 text-slate-300">
          Loading…
        </div>
      }
    >
      <BookingConfirmationInner />
    </Suspense>
  );
}
