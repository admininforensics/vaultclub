import { ProgrammeForm } from "@/components/ProgrammeForm";

export default function NewProgrammePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Add programme</h1>
      <p className="mt-2 text-slate-400">
        Sports, music lessons, or tutoring — shown under Programmes on the public
        site.
      </p>
      <ProgrammeForm />
    </div>
  );
}
