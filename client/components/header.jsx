"use client";

import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import { FileText, GraduationCap, LayoutDashboard, PenTool } from "lucide-react";
import Link from "next/link";

export function Header() {
  const { isSignedIn } = useUser();

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">C</div>
          CareerCoach
        </Link>

        {isSignedIn && (
          <nav className="hidden md:flex items-center gap-8">
            {[
              { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
              { name: "Resume", href: "/dashboard/resume", icon: FileText },
              { name: "ATS Checker", href: "/dashboard/ats", icon: PenTool },
              { name: "Cover Letter", href: "/dashboard/cover-letter", icon: PenTool },
              { name: "Interview", href: "/dashboard/interview", icon: GraduationCap },
            ].map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 border border-white/10"
                }
              }}
            />
          ) : (
            <Link href="/sign-in">
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white hover:text-white">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
