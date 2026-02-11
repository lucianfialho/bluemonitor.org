import { cookies } from "next/headers";
import { createHash } from "crypto";

const COOKIE_NAME = "admin_session";

function getSessionToken(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD is not set");
  return createHash("sha256").update(password).digest("hex");
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME);
    return session?.value === getSessionToken();
  } catch {
    return false;
  }
}

export function validatePassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}

export { COOKIE_NAME, getSessionToken };
