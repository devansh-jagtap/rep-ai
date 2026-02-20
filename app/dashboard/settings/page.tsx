import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "../actions";
import { SettingsClient } from "./settings-client";
import { getProfileById } from "@/lib/db";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const [data, profile] = await Promise.all([
    getDashboardData(),
    getProfileById(session.user.id),
  ]);

  if (!data) redirect("/onboarding");

  return (
    <SettingsClient
      user={{
        email: session.user.email || "",
        name: profile?.name || session.user.name || "",
        plan: profile?.plan || "free",
        credits: profile?.credits ?? 0,
      }}
      portfolio={{
        handle: data.portfolio.handle,
      }}
    />
  );
}
