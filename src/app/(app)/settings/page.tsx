import { Phone, MessageSquare, Bot, FileText } from "lucide-react";

const SETTINGS = [
  { icon: Phone, title: "Intake phone number", desc: "The Twilio number that answers inbound client calls." },
  { icon: MessageSquare, title: "SMS settings", desc: "Sender number and follow-up message templates." },
  { icon: Bot, title: "AI model provider", desc: "Model used for qualification, scoring and summaries." },
  { icon: FileText, title: "Document templates", desc: "Default document requests per case type." },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure your firm&apos;s intake, messaging and AI behaviour.
        </p>
      </header>

      <div className="space-y-3">
        {SETTINGS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="glass-card glass-card-hover flex items-center gap-4 rounded-2xl p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground/5 text-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-medium text-foreground">{s.title}</h2>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
