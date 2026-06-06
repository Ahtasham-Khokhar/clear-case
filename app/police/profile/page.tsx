/**
 * Police Officer Profile Page
 * Displays officer details and allows profile management
 */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shield, Phone, MapPin } from "lucide-react"
import { getSupabaseClient, type User } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

export default function PoliceProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setLoading(false)
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/auth/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/police")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Officer Profile</h1>
                <p className="text-sm text-gray-600">View and manage your profile</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Your officer information and credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Shield className="h-12 w-12 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold">{user?.full_name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">Badge #{user?.badge_number}</Badge>
                    <Badge className="bg-blue-100 text-blue-800">Police Officer</Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || ""} readOnly />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={user?.phone || ""} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Station Information */}
          <Card>
            <CardHeader>
              <CardTitle>Station Assignment</CardTitle>
              <CardDescription>Your assigned police station</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.station ? (
                <div>
                  <h3 className="font-semibold text-lg">{user.station.name}</h3>
                  <div className="text-sm text-gray-600 space-y-2 mt-2">
                    {user.station.address && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span>{user.station.address}</span>
                      </div>
                    )}
                    {user.station.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{user.station.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No station assigned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 