import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getSessionUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      description="Sign in to access your local dashboard, inventory, settings, and live backend-connected data."
      eyebrow="Secure access"
      title="Welcome back"
    >
      <LoginForm />
    </AuthShell>
  );
}

