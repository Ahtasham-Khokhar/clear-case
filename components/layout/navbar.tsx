"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Menu, X, Bell } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">ClearCase</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link href="/features" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Features
            </Link>
            <Link href="/report" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Report Case
            </Link>
            <Link href="/resources" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Resources
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {/* Optional: <Badge className="absolute -top-1 -right-1 px-1 min-w-4 h-4 text-[10px]">3</Badge> */}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Register</Link>
            </Button>
          </div>

          {/* Mobile Right Controls (Menu & Notification) */}
          <div className="md:hidden flex items-center space-x-3">
            <Button variant="outline" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-primary focus:outline-none p-1.5 rounded-md border border-input bg-background"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
              {["/", "/features", "/report", "/resources", "/about", "/contact"].map((path) => (
                <Link
                  key={path}
                  href={path}
                  className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {path === "/" ? "Home" : path.replace("/", "").split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                </Link>
              ))}

              <div className="border-t border-border pt-4 space-y-2 px-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                    Register
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}