import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { UserProvider } from "@/lib/hooks/use-user";
import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Career Coach AI",
  description: "Your personal AI-powered career growth assistant.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="dark">
        <head>
          {/* Preconnect to critical third-party production origins */}
          <link rel="dns-prefetch" href="https://clerk.career-boast-ai.vercel.app" />
          <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || "https://career-boast-backend.onrender.com"} />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-black text-white antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <UserProvider>
              <Header />
              {children}
              <SpeedInsights />
              <Toaster position="bottom-right" />
            </UserProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
