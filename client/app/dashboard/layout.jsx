import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getServerApi } from "@/lib/api-client";
import { auth } from "@clerk/nextjs/server";
import { Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const { userId, getToken } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const token = await getToken();
  let user = null;
  
  try {
    const api = getServerApi(token);
    const userData = await api.user.getMe();
    user = userData.user;
  } catch (error) {
    console.error("Failed to fetch user in layout:", error);
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar user={user} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar (Desktop) */}
        <header className="hidden lg:block sticky top-0 z-30 bg-black/50 border-b border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400 font-medium">AI-Powered</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
