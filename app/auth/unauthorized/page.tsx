"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle, ArrowLeft } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-red-600 hover:text-red-700">
            <Shield className="h-8 w-8" />
            <span className="text-2xl font-bold">ClearCase</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page. Please contact your administrator if you believe this is an
              error.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                If you're a police officer, your account may need to be verified by an administrator before you can
                access the system.
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <Button className="w-full" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/login">
                  Try Different Account
                </Link>
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/contact">
                  Contact Support
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
