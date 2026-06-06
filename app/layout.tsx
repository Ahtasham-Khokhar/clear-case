import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Navbar } from "@/components/layout/navbar"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ClearCase - Police Case Management System",
  description: "Modern police case management system for efficient law enforcement",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main>{children}</main>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}