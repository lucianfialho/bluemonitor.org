import { authServer } from "@/lib/auth/server";

export async function isAdmin(): Promise<boolean> {
  const { data: session } = await authServer.getSession();
  return session?.user?.role === "admin";
}

export async function requireAdmin() {
  const { data: session } = await authServer.getSession();
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session.user;
}
