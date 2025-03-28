"use client"

import { useEffect } from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { RouteChangeProvider } from "@/components/route-change-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"

import "./globals.css"

// Load font only once
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Disable console logging in both development and production to improve performance
  // Only do this on the client side
  useEffect(() => {
    // Create a backup of essential console methods
    const originalConsole = {
      error: console.error,
      warn: console.warn,
      log: console.log,
      info: console.info,
      debug: console.debug,
    };

    // In production, disable all console methods to improve performance
    if (process.env.NODE_ENV === 'production') {
      console.log = () => {};
      console.info = () => {};
      console.debug = () => {};
    } else {
      // In development, only disable log, keep error and warn
      console.log = () => {};
      console.info = () => {};
      console.debug = () => {};
    }

    // Keep error and warn capabilities for important issues
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;

    return () => {
      // Restore original methods on cleanup
      console.log = originalConsole.log;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
    };
  }, []);

  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} antialiased text-foreground bg-background flex flex-col min-h-screen w-full overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex flex-col relative min-h-screen">
              <RouteChangeProvider>
                <SidebarProvider defaultOpen={true}>
                  <div className="min-h-screen flex flex-col">
                    {children}
                  </div>
                </SidebarProvider>
              </RouteChangeProvider>
              <Toaster />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}