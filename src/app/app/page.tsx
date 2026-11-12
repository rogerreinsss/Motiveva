import type { Metadata } from "next";
import { HabitApp } from "@/components/app/HabitApp";
import { HabitProvider } from "@/components/app/HabitProvider";
import { OnboardingGate } from "@/components/app/Onboarding";
import { ProfileProvider } from "@/components/app/ProfileProvider";
import { ReminderProvider } from "@/components/app/ReminderProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ToastProvider } from "@/components/app/ToastProvider";
import { APP_PATH } from "@/lib/site";

export const metadata: Metadata = {
  title: "Abrir la app",
  description:
    "Tu espacio de hábitos en Motiveva: hoy, hábitos, estadísticas y ajustes, sincronizados con tu cuenta.",
  alternates: { canonical: APP_PATH },
  // Private, gated screen: never index it.
  robots: { index: false, follow: false },
};

export default function AppPage() {
  return (
    <ToastProvider>
      <HabitProvider>
        <RequireAuth>
          <ProfileProvider>
            <OnboardingGate>
              <ReminderProvider>
                <HabitApp />
              </ReminderProvider>
            </OnboardingGate>
          </ProfileProvider>
        </RequireAuth>
      </HabitProvider>
    </ToastProvider>
  );
}
