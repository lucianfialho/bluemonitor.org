import { Metadata } from "next";
import { authServer } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import DashboardShell from "./DashboardShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await authServer.getSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return (
    <DashboardShell user={session.user}>
      {children}
    </DashboardShell>
  );
}
