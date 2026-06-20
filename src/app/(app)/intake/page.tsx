import { PhoneCall, Sparkles } from "lucide-react";

export default function IntakePage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Voice Intake
        </h1>
        <p className="text-sm text-muted-foreground">
          Simulate an AI intake call and watch the transcript and extracted lead fields
          build in real time.
        </p>
      </header>

      <div className="glass-card flex flex-col items-center justify-center gap-3 rounded-2xl p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/5 text-foreground">
          <PhoneCall className="h-5 w-5" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          Intake simulation coming next
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          This is where the live transcript, AI actions, and structured lead extraction
          will appear. We&apos;ll wire it to the FastAPI voice layer (Twilio · LiveKit ·
          Deepgram) in a later phase.
        </p>
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Planned
        </span>
      </div>
    </div>
  );
}
