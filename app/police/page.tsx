/**
 * Police Officer Dashboard
 * Main dashboard for police officers to view assigned cases, analytics,
 * and manage their workload
 */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, FileText, Clock, CheckCircle, AlertCircle, TrendingUp, Search } from "lucide-react"
import Link from "next/link"
import { getSupabaseClient, type Case, type User } from "@/lib/supabase"

export default function PoliceDashboard() {
  const [cases, setCases] = useState<Case[]>([])
  const [filteredCases, setFilteredCases] = useState<Case[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    filterCases()
  }, [cases, searchTerm, statusFilter, priorityFilter])

  const loadDashboardData = async () => {
    try {
      const supabase = getSupabaseClient()

      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) return

      // Get user profile
      const { data: userProfile } = await supabase.from("users").select("*").eq("auth_user_id", authUser.id).single()

      setUser(userProfile)

      if (userProfile) {
        // Load assigned cases
        const { data: casesData } = await supabase
          .from("cases")
          .select(`
            *,
            citizen:users(full_name, phone)
          `)
          .eq("assigned_officer_id", userProfile.id)
          .order("created_at", { ascending: false })

        setCases(casesData || [])
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterCases = () => {
    let filtered = cases

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (case_) =>
          case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (case_.case_number?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
          case_.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((case_) => case_.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((case_) => case_.priority === priorityFilter)
    }

    setFilteredCases(filtered)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "under_investigation":
        return <AlertCircle className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      case "closed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Calculate statistics
  const stats = {
    total: cases.length,
    pending: cases.filter((c) => c.status === "pending").length,
    investigating: cases.filter((c) => c.status === "under_investigation").length,
    resolved: cases.filter((c) => c.status === "resolved").length,
    urgent: cases.filter((c) => c.priority === "urgent").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Officer {user?.full_name}</h1>
                <p className="text-sm text-gray-600">Badge #{user?.badge_number} • Police Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/police/analytics">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/police/profile">Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Investigating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.investigating}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList>
            <TabsTrigger value="cases">My Cases</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search cases..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_investigation">Under Investigation</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Cases List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Assigned Cases ({filteredCases.length})</h2>
              </div>

              {filteredCases.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {cases.length === 0 ? "No cases assigned" : "No cases match your filters"}
                    </h3>
                    <p className="text-gray-600">
                      {cases.length === 0
                        ? "You don't have any cases assigned yet. Check back later for new assignments."
                        : "Try adjusting your search or filter criteria."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredCases.map((case_) => (
                    <Card key={case_.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <CardTitle className="text-lg">{case_.title}</CardTitle>
                              <Badge className={getPriorityColor(case_.priority ?? 'medium')}>{(case_.priority ?? 'medium').toUpperCase()}</Badge>
                            </div>
                            <CardDescription>
                              Case #{case_.case_number ?? 'N/A'} • {(case_.case_type ?? 'general').replace("_", " ")}
                              {(case_ as any).citizen && <> • Reported by {(case_ as any).citizen.full_name}</>}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(case_.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(case_.status)}
                              <span className="capitalize">{case_.status.replace("_", " ")}</span>
                            </div>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4 line-clamp-2">{case_.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500 space-y-1">
                            <div>Reported: {new Date(case_.created_at).toLocaleDateString()}</div>
                            {case_.incident_date && (
                              <div>Incident: {new Date(case_.incident_date).toLocaleDateString()}</div>
                            )}
                          </div>
                          <Button asChild>
                            <Link href={`/police/cases/${case_.id}`}>Manage Case</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and actions on your cases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Recent activity will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
