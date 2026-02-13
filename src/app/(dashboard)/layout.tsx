import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol, nombre, propietario_id")
    .eq("id", session.user.id)
    .single();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <DashboardNav
        userEmail={session.user.email ?? ""}
        userName={profile?.nombre ?? undefined}
        rol={profile?.rol ?? "viewer"}
      />
      <main className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full overflow-x-hidden">{children}</main>
    </div>
  );
}
