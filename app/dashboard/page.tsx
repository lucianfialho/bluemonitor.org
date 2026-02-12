import { Metadata } from "next";
import { authServer } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { data: session } = await authServer.getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return <DashboardClient user={session.user} />;
}
