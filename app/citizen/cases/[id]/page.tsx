/**
 * Individual Case Details Page for Citizens
 * Shows detailed case information, status updates, and communication with officers
 */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MessageSquare, FileText, Clock, User, MapPin, Phone, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { apiClient } from "@/lib/api-client"
import { Case, CaseUpdate } from "@/lib/database.types"

export default function CaseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [case_, setCase] = useState<Case | null>(null)
  const [updates, setUpdates] = useState<CaseUpdate[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const loadCaseDetails = async () => {
    try {
      setLoading(true)
      // Load case details using API client
      const response = await apiClient.getCase(params.id as string)
      
      // Check if we have a valid response
      if (!response) {
        console.error("No response received from API")
        setCase(null)
        return
      }

      // Set case and updates from response
      setCase(response.case)
      setUpdates(response.updates || [])

      // Log success
      console.log("Case details loaded successfully:", {
        caseId: response.case?.id,
        updatesCount: response.updates?.length
      })
    } catch (error: any) {
      console.error("Error loading case details:", error)
      setCase(null)
      
      // If we have a specific error message from the API, we could show it
      if (error.message) {
        console.error("API Error:", error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      loadCaseDetails()
    }
  }, [params.id])

  const sendMessage = async () => {
    if (!newMessage.trim() || !case_) return

    setSending(true)
    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) {
        console.error("No authenticated user found")
        return
      }

      const { data: userProfile } = await supabase.from("users").select("id").eq("auth_user_id", authUser.id).single()

      if (!userProfile) {
        console.error("No user profile found")
        return
      }

      // Add case update
      const { error: updateError } = await supabase.from("case_updates").insert({
        case_id: case_.id,
        updated_by: userProfile.id,
        update_type: "comment",
        message: newMessage,
      })

      if (updateError) {
        console.error("Error sending message:", updateError)
        return
      }

      setNewMessage("")
      await loadCaseDetails() // Reload to show new message
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "under_investigation":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading case details...</p>
        </div>
      </div>
    )
  }

  if (!case_) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Case Not Found</h2>
              <p className="text-gray-600 mb-6">
                The case you're looking for doesn't exist or you don't have access to it. This could be because:
          </p>
              <ul className="text-left text-gray-600 mb-6 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  The case ID is incorrect
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  The case has been deleted
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  You don't have permission to view this case
                </li>
              </ul>
            </div>
            <div className="space-x-4">
              <Button onClick={() => router.push("/citizen")} variant="default">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
              <Button onClick={() => router.push("/citizen/report")} variant="outline">
                Report New Case
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/citizen")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Case #{case_.case_number}</h1>
                <p className="text-sm text-gray-600">{case_.title}</p>
              </div>
            </div>
            <Badge className={getStatusColor(case_.status)}>{case_.status.replace("_", " ").toUpperCase()}</Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Case Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{case_.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Case Type</h4>
                   <p className="text-gray-600 capitalize">{(case_.case_type ?? "").replace("_", " ")}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Priority</h4>
                    <p className="text-gray-600 capitalize">{case_.priority}</p>
                  </div>
                </div>

                {case_.incident_date && (
                  <div>
                    <h4 className="font-medium text-gray-900">Incident Date</h4>
                    <p className="text-gray-600">{new Date(case_.incident_date).toLocaleString()}</p>
                  </div>
                )}

                {case_.incident_location && (
                  <div>
                    <h4 className="font-medium text-gray-900">Incident Location</h4>
                    <p className="text-gray-600">{case_.incident_location}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Case Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Case Updates
                </CardTitle>
                <CardDescription>Updates and communication about your case</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* New Message Input */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a message or update..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                      {sending ? "Sending..." : "Send Message"}
                    </Button>
                  </div>

                  <Separator />

                  {/* Updates List */}
                  <div className="space-y-4">
                    {updates.map((update) => (
                      <div key={update.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {update.updated_by_user?.full_name || "System"}
                              {update.updated_by_user?.role && (
                                <span className="text-sm text-gray-600 ml-2">({update.updated_by_user.role})</span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                                {new Date(update.created_at).toLocaleString()}
                              </p>
                          </div>
                          {update.update_type === "status_change" && (
                            <Badge variant="outline">Status Change</Badge>
                          )}
                        </div>
                        <p className="text-gray-800">{update.message}</p>
                      </div>
                    ))}

                    {updates.length === 0 && (
                      <p className="text-center text-gray-600 py-4">No updates yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assigned Officer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Case Handler
                </CardTitle>
              </CardHeader>
              <CardContent>
                {case_.assigned_officer ? (
                  <div className="space-y-2">
                    <p className="font-medium">{case_.assigned_officer.full_name}</p>
                    {case_.assigned_officer.badge_number && (
                      <p className="text-sm text-gray-600">Badge #{case_.assigned_officer.badge_number}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">Not yet assigned</p>
                  )}
              </CardContent>
            </Card>

            {/* Police Station */}
            {case_.assigned_station && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Assigned Station
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{case_.assigned_station.name}</p>
                    {case_.assigned_station.phone && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {case_.assigned_station.phone}
                      </p>
                    )}
                    {case_.assigned_station.address && (
                      <p className="text-sm text-gray-600">{case_.assigned_station.address}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
              <Card>
                <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Timeline
                </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{new Date(case_.created_at).toLocaleString()}</p>
                      </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium">{new Date(case_.updated_at).toLocaleString()}</p>
                  </div>
                  </div>
                </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
