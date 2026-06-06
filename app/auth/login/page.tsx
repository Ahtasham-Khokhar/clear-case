"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

type UserRole = "citizen" | "police" | "admin"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { login } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError("") // Clear error on input change
  }

  const handleRedirect = (role: UserRole) => {
    switch (role) {
      case "citizen":
        router.push("/citizen")
        break
      case "police":
        router.push("/police")
        break
      case "admin":
        router.push("/admin")
        break
      default:
        setError("Invalid user role")
        setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validation
      if (!formData.email || !formData.password) {
        setError("Please fill in all required fields")
        return
      }

      setLoading(true)
      setError("")

      const result = await login(formData.email, formData.password)

      if (result.success && result.user) {
        const description = 
          result.user.role === "police" 
            ? "Welcome back, Officer! Redirecting to police dashboard..."
            : result.user.role === "admin"
              ? "Welcome back, Admin! Redirecting to admin dashboard..."
              : "Welcome back! Redirecting to citizen dashboard..."

        toast({
          title: "Login Successful!",
          description,
          duration: 3000,
        })

        // Redirect based on role
        const role = result.user.role as UserRole
        if (!role) {
          setError("User role not found")
          setLoading(false)
          return
        }

        handleRedirect(role)
      } else {
        setLoading(false) // Reset loading state when login fails
        setError(result.error || "Login failed. Please try again.")
        toast({
          title: "Login Failed",
          description: result.error || "Please check your credentials and try again.",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error: any) {
      setLoading(false) // Reset loading state when error occurs
      console.error("Login error:", error)
      setError(error.message || "An unexpected error occurred")
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your ClearCase account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/15 border border-destructive/30 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-center">
            <div className="text-sm text-muted-foreground">
              <Link href="/auth/forgot-password" className="text-primary hover:underline">
                Forgot your password?
              </Link>
            </div>
            <div className="text-sm space-x-1">
              <span className="text-muted-foreground">Don't have an account?</span>
              <Link href="/auth/register" className="text-primary hover:underline">
                Register now
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
