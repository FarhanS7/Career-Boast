import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { UserProvider } from "@/lib/hooks/use-user";
import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Optimized font loading with display swap for better FCP
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  preload: true,
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
          {/* Preconnect to critical third-party origins */}
          <link rel="preconnect" href="https://clerk.shared.lcl.dev" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://clerk.shared.lcl.dev" />
          {/* Preconnect to your API server if external */}
          <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"} />
        </head>
        <body className={`${inter.className} bg-black text-white antialiased`}>
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
