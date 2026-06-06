/**
 * Police Case Management Page
 * Detailed case view for police officers with update capabilities,
 * evidence management, and communication features
 */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FileText, Clock, User, MapPin, Phone, Edit } from "lucide-react"
import { getSupabaseClient, type Case, type CaseUpdate } from "@/lib/supabase"

export default function PoliceCaseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [case_, setCase] = useState<Case | null>(null)
  const [updates, setUpdates] = useState<CaseUpdate[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadCaseDetails()
    }
  }, [params.id])

  const loadCaseDetails = async () => {
    try {
      const supabase = getSupabaseClient()

      // Load case details
      const { data: caseData } = await supabase
        .from("cases")
        .select(`
          *,
          reporter:users!cases_reporter_id_fkey(full_name, phone, email),
          assigned_station:police_stations(name, phone, address)
        `)
        .eq("id", params.id)
        .single()

      setCase(caseData)
      setNewStatus(caseData?.status || "")

      // Load case updates
      const { data: updatesData } = await supabase
        .from("case_updates")
        .select(`
          *,
          updated_by_user:users!case_updates_updated_by_fkey(full_name, role)
        `)
        .eq("case_id", params.id)
        .order("created_at", { ascending: false })

      setUpdates(updatesData || [])
    } catch (error) {
      console.error("Error loading case details:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateCase = async () => {
    if (!case_) return

    setUpdating(true)
    try {
      const supabase = getSupabaseClient()

      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) return

      const { data: userProfile } = await supabase.from("users").select("id").eq("clerk_id", authUser.id).single()

      if (!userProfile) return

      // Update case status if changed
      if (newStatus !== case_.status) {
        await supabase
          .from("cases")
          .update({
            status: newStatus as any,
            resolved_at: newStatus === "resolved" ? new Date().toISOString() : null,
          })
          .eq("id", case_.id)

        // Add status update
        await supabase.from("case_updates").insert({
          case_id: case_.id,
          updated_by: userProfile.id,
          update_type: "status_change",
          old_status: case_.status as any,
          new_status: newStatus as any,
          message: `Status updated from ${case_.status} to ${newStatus}`,
        })

        // Create notification for citizen
        await supabase.from("notifications").insert({
          user_id: case_.reporter_id,
          case_id: case_.id,
          title: "Case Status Updated",
          message: `Your case "${case_.title}" status has been updated to ${newStatus.replace("_", " ")}`,
          type: "case_update",
        })
      }

      // Add message if provided
      if (newMessage.trim()) {
        await supabase.from("case_updates").insert({
          case_id: case_.id,
          updated_by: userProfile.id,
          update_type: "comment",
          message: newMessage,
        })

        // Create notification for citizen
        await supabase.from("notifications").insert({
          user_id: case_.reporter_id,
          case_id: case_.id,
          title: "New Message from Officer",
          message: `Officer has added a new update to your case "${case_.title}"`,
          type: "case_update",
        })
      }

      setNewMessage("")
      loadCaseDetails() // Reload to show updates
    } catch (error) {
      console.error("Error updating case:", error)
    } finally {
      setUpdating(false)
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Case Not Found</h2>
          <p className="text-gray-600 mb-4">
            The case you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push("/police")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
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
              <Button variant="ghost" onClick={() => router.push("/police")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Case #{case_.case_number}</h1>
                <p className="text-sm text-gray-600">{case_.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(case_.priority)}>{case_.priority.toUpperCase()} PRIORITY</Badge>
              <Badge className={getStatusColor(case_.status)}>{case_.status.replace("_", " ").toUpperCase()}</Badge>
            </div>
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
                    <p className="text-gray-600 capitalize">{case_.case_type.replace("_", " ")}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Priority</h4>
                    <Badge className={getPriorityColor(case_.priority)}>{case_.priority.toUpperCase()}</Badge>
                  </div>
                </div>

                {case_.incident_date && (
                  <div>
                    <h4 className="font-medium text-gray-900">Incident Date & Time</h4>
                    <p className="text-gray-600">{new Date(case_.incident_date).toLocaleString()}</p>
                  </div>
                )}

                {case_.incident_location && (
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Incident Location
                    </h4>
                    <p className="text-gray-600">{case_.incident_location}</p>
                    {case_.incident_latitude && case_.incident_longitude && (
                      <p className="text-sm text-gray-500">
                        Coordinates: {case_.incident_latitude}, {case_.incident_longitude}
                      </p>
                    )}
                  </div>
                )}

                {case_.witness_details && (
                  <div>
                    <h4 className="font-medium text-gray-900">Witness Information</h4>
                    <p className="text-gray-600">{case_.witness_details}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Case Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Case Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {updates.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No updates yet</p>
                ) : (
                  <div className="space-y-4">
                    {updates.map((update, index) => (
                      <div key={update.id}>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {(update as any).updated_by_user?.full_name || "System"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {(update as any).updated_by_user?.role === "police" ? "(Officer)" : "(Citizen)"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(update.created_at).toLocaleString()}
                              </span>
                            </div>
                            {update.message && <p className="text-gray-600 mt-1">{update.message}</p>}
                            {update.old_status && update.new_status && (
                              <p className="text-sm text-blue-600 mt-1">
                                Status changed from {update.old_status.replace("_", " ")} to{" "}
                                {update.new_status.replace("_", " ")}
                              </p>
                            )}
                          </div>
                        </div>
                        {index < updates.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Update Case */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="h-5 w-5 mr-2" />
                  Update Case
                </CardTitle>
                <CardDescription>Update case status and add progress notes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Case Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_investigation">Under Investigation</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Progress Notes</label>
                  <Textarea
                    placeholder="Add notes about case progress, findings, or next steps..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={updateCase}
                  disabled={updating || (newStatus === case_.status && !newMessage.trim())}
                  className="w-full"
                >
                  {updating ? "Updating..." : "Update Case"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter Information */}
            <Card>
              <CardHeader>
                <CardTitle>Reporter Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">{(case_ as any).reporter?.full_name}</span>
                </div>
                {(case_ as any).reporter?.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">{(case_ as any).reporter.phone}</span>
                  </div>
                )}
                {(case_ as any).reporter?.email && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{(case_ as any).reporter.email}</span>
                  </div>
                )}
                {case_.reporter_address && (
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Address</h4>
                    <p className="text-sm text-gray-600">{case_.reporter_address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Case Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Case Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Reported:</span>
                    <span className="text-gray-600">{new Date(case_.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {case_.assigned_at && (
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Assigned:</span>
                      <span className="text-gray-600">{new Date(case_.assigned_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                {case_.resolved_at && (
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Resolved:</span>
                      <span className="text-gray-600">{new Date(case_.resolved_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Police Station */}
            {(case_ as any).assigned_station && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Station</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="font-medium">{(case_ as any).assigned_station.name}</div>
                  {(case_ as any).assigned_station.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{(case_ as any).assigned_station.phone}</span>
                    </div>
                  )}
                  {(case_ as any).assigned_station.address && (
                    <div className="text-sm text-gray-600">{(case_ as any).assigned_station.address}</div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Evidence Files */}
            {case_.evidence_files && case_.evidence_files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Evidence Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {case_.evidence_files.map((file: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
