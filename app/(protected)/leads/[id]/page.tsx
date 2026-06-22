import { LeadDetailsClient } from "./components/LeadDetailsClient";
import { createClient } from "@/lib/supabase/server";

export default async function LeadDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: currentUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (currentUser && currentUser.role === "admin") {
      isAdmin = true;
    }
  }

  return <LeadDetailsClient id={id} isAdmin={isAdmin} />;
}
