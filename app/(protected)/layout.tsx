import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile from public.users table
  const { data: profile } = await supabase
    .from("users")
    .select("name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar userRole={profile?.role} userName={profile?.name} />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden relative">
        <TopNavbar />
        
        {/* Scrollable page area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          <PageWrapper>{children}</PageWrapper>
        </main>
      </div>
    </div>
  );
}
