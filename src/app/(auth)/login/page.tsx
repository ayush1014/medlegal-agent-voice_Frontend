import { AuthForm } from "@/components/auth/auth-form";
import { signInCredentials } from "@/lib/auth/actions";

export default function LoginPage() {
  return (
    <AuthForm mode="signin" onAuthenticate={signInCredentials} nextPath="/dashboard" />
  );
}
