"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function PendingApprovalPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Redirect if user is not logged in
      if (!user) {
        router.replace("/auth/login")
        return
      }

      // Redirect if user is already active
      if (user.is_active && user.role === "citizen") {
        router.replace("/citizen")
        return
      }

      if (user.is_active && user.role === "police") {
        router.replace("/police")
        return
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Account Pending Approval</CardTitle>
          <CardDescription>
            {user?.role === "police"
              ? "Your police officer account is pending verification and approval."
              : "Your account is currently inactive and pending approval."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800">
              {user?.role === "police" ? (
                <>
                  Our administrative team is verifying your credentials. This process typically takes 1-2 business days.
                  You'll receive an email notification once your account is approved.
                </>
              ) : (
                <>
                  Your account is currently under review. You'll receive an email notification once your account is
                  activated.
                </>
              )}
            </p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>If you have any questions, please contact our support team:</p>
            <p>Email: support@clearcase.com</p>
            <p>Phone: +1 (555) 123-4567</p>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>ClearCase Security System</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 