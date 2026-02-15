import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { DashboardShell } from "@/components/DashboardShell";

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
    <DashboardShell
      userEmail={session.user.email ?? ""}
      userName={profile?.nombre ?? undefined}
      rol={profile?.rol ?? "viewer"}
    >
      <div className="max-w-6xl mx-auto w-full min-w-0">{children}</div>
    </DashboardShell>
  );
}
