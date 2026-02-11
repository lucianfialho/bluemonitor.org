import { isAuthenticated } from "@/lib/admin-auth";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

export const metadata = { title: "Admin", robots: "noindex, nofollow" };

export default async function AdminPage() {
  const authed = await isAuthenticated();

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Admin Login
        </h1>
        <AdminLogin />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <AdminDashboard />
    </div>
  );
}
