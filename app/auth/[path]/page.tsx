import { AuthView } from "@neondatabase/auth/react";
import { authViewPaths } from "@neondatabase/auth/react/ui/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4 py-12">
      <AuthView path={path} />
    </div>
  );
}
