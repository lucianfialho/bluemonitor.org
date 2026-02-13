import { requireAdmin } from "@/lib/admin-auth";
import AdminDashboard from "./AdminDashboard";

export const metadata = { title: "Admin", robots: "noindex, nofollow" };

export default async function AdminPage() {
  const user = await requireAdmin();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Access Denied
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          You don&apos;t have admin access. Please sign in with an admin account.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <AdminDashboard />
    </div>
  );
}
