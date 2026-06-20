import { AuthForm } from "@/components/auth/auth-form";
import { signUpCredentials } from "@/lib/auth/actions";

export default function SignupPage() {
  // After sign-up, route into phone onboarding (firm intake number).
  return (
    <AuthForm mode="signup" onAuthenticate={signUpCredentials} nextPath="/onboarding" />
  );
}
