import { AppShell } from "@/components/layout/app-shell";

// Wraps every authenticated console page in the floating glass shell.
// userEmail is a placeholder until the FastAPI session is wired in.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell userEmail="operator@medlegal.ai">{children}</AppShell>;
}
