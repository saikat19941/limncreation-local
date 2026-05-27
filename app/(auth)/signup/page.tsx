import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getSessionUser } from "@/lib/auth";

export default async function SignupPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      description="Create a local account inside the limncreation_local database and start managing inventory right away."
      eyebrow="New workspace user"
      title="Create your account"
    >
      <SignupForm />
    </AuthShell>
  );
}

