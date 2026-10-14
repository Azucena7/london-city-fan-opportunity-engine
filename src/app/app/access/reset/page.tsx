import type { Metadata } from "next";
import { AppWorkspaceShell } from "@/components/AppWorkspaceShell";
import { PasswordResetForm } from "@/components/PasswordResetForm";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your AVELA account from the reset link sent by email."
};

export default function PasswordResetPage() {
  return (
    <AppWorkspaceShell
      active="access"
      eyebrow="Account"
      title="Reset your password"
      subtitle="Open this page from the reset link in your email."
    >
      <PasswordResetForm />
    </AppWorkspaceShell>
  );
}
