"use client";

import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import {
    Briefcase,
    FileSearch,
    FileText,
    GraduationCap,
    LayoutDashboard,
    Menu,
    PenTool,
    Sparkles,
    X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Resume", href: "/dashboard/resume", icon: FileText },
  { name: "ATS Checker", href: "/dashboard/ats", icon: FileSearch },
  { name: "Job Matcher", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Cover Letter", href: "/dashboard/cover-letter", icon: PenTool },
  { name: "Interview Prep", href: "/dashboard/interview", icon: GraduationCap },
];

export function DashboardSidebar({ user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-zinc-900/50 border-r border-white/10 backdrop-blur-xl z-50 transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">
                C
              </div>
              <span className="text-lg font-bold text-white">CareerCoach</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 border border-white/10",
                  },
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Top bar for mobile toggle */}
      <header className="sticky top-0 z-30 bg-black/50 border-b border-white/10 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
          
          <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400 font-medium">AI</span>
              </div>
          </div>
        </div>
      </header>
    </>
  );
}
