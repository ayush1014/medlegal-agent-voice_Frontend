import { redirect } from "next/navigation";

// Entry point. Once real auth lands this will branch on session; for now it
// sends operators straight to the console.
export default function Home() {
  redirect("/dashboard");
}
