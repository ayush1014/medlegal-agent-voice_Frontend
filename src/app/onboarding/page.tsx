"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlassButton } from "@/components/ui/glass-button";
import { GradientBackground } from "@/components/ui/gradient-background";
import { BrandMark } from "@/components/brand";

// Format raw digits into US "(404) 555-1234" as the operator types.
function formatPhone(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 10);
  const len = d.length;
  if (len < 4) return d;
  if (len < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export default function OnboardingPhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const digits = phone.replace(/\D/g, "");
  const isValid = digits.length === 10;

  const submit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    // TODO: persist the firm's intake number via FastAPI, then provision Twilio.
    await new Promise((r) => setTimeout(r, 700));
    router.push("/dashboard");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="bg-background min-h-screen w-screen flex flex-col">
      <div className="fixed top-4 left-4 z-20 md:left-1/2 md:-translate-x-1/2">
        <BrandMark />
      </div>
      <div className="fixed top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-card relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <GradientBackground />
        </div>

        <fieldset
          disabled={submitting}
          className="relative z-10 flex flex-col items-center gap-8 w-[320px] mx-auto p-4"
        >
          <motion.div
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full flex flex-col items-center text-center gap-3"
          >
            <p className="font-serif font-light text-4xl sm:text-5xl tracking-tight text-foreground">
              Your intake line
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              Enter the phone number where potential clients will reach your firm.
            </p>
          </motion.div>

          <div className="w-full space-y-6">
            <div className="relative w-full">
              <div className="glass-input-wrap w-full">
                <div className="glass-input">
                  <span className="glass-input-text-area"></span>
                  <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                    <Phone className="h-5 w-5 text-foreground/80 flex-shrink-0" />
                  </div>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoFocus
                    placeholder="(404) 555-1234"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    onKeyDown={handleKeyDown}
                    className="relative z-10 h-full w-0 flex-grow bg-transparent text-foreground placeholder:text-foreground/60 focus:outline-none"
                  />
                  <div
                    className={cn(
                      "relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
                      isValid ? "w-10 pr-1" : "w-0",
                    )}
                  >
                    <GlassButton
                      type="button"
                      onClick={submit}
                      size="icon"
                      aria-label="Continue"
                      contentClassName="text-foreground/80 hover:text-foreground"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </GlassButton>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Skip for now
            </button>
          </div>
        </fieldset>
      </div>
    </div>
  );
}
