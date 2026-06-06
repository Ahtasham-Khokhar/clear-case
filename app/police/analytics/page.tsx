/**
 * Police Analytics Dashboard
 * Provides data visualization and insights for police officers
 * to track case trends, performance metrics, and resource allocation
 */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, BarChart3, PieChart, TrendingUp, Map, Calendar, Clock } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"

export default function PoliceAnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30days")
  const [stats, setStats] = useState({
    totalCases: 0,
    resolvedCases: 0,
    pendingCases: 0,
    avgResolutionTime: 0,
    casesByType: {} as Record<string, number>,
    casesByPriority: {} as Record<string, number>,
    casesByDay: {} as Record<string, number>,
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      const supabase = getSupabaseClient()

      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) return

      // Get user profile
      const { data: userProfile } = await supabase.from("users").select("id").eq("auth_user_id", authUser.id).single()

      if (!userProfile) return

      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      if (timeRange === "7days") {
        startDate.setDate(endDate.getDate() - 7)
      } else if (timeRange === "30days") {
        startDate.setDate(endDate.getDate() - 30)
      } else if (timeRange === "90days") {
        startDate.setDate(endDate.getDate() - 90)
      } else if (timeRange === "year") {
        startDate.setFullYear(endDate.getFullYear() - 1)
      }

      // Load cases assigned to the officer
      const { data: casesData } = await supabase
        .from("cases")
        .select("*")
        .eq("assigned_officer_id", userProfile.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())

      if (casesData) {
        const cases = casesData
        const casesByType: Record<string, number> = {}
        const casesByPriority: Record<string, number> = {}
        const casesByDay: Record<string, number> = {}
        let totalResolutionTime = 0
        let resolvedCount = 0

        cases.forEach((case_) => {
          // Count by type
          casesByType[case_.case_type] = (casesByType[case_.case_type] || 0) + 1

          // Count by priority
          casesByPriority[case_.priority] = (casesByPriority[case_.priority] || 0) + 1

          // Count by day
          const day = new Date(case_.created_at).toLocaleDateString()
          casesByDay[day] = (casesByDay[day] || 0) + 1

          // Calculate resolution time for resolved cases
          if (case_.status === "resolved" && case_.resolved_at) {
            const createdDate = new Date(case_.created_at)
            const resolvedDate = new Date(case_.resolved_at)
            const resolutionTime = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60) // hours
            totalResolutionTime += resolutionTime
            resolvedCount++
          }
        })

        setStats({
          totalCases: cases.length,
          resolvedCases: cases.filter((c) => c.status === "resolved").length,
          pendingCases: cases.filter((c) => c.status === "pending").length,
          avgResolutionTime: resolvedCount > 0 ? Math.round(totalResolutionTime / resolvedCount) : 0,
          casesByType,
          casesByPriority,
          casesByDay,
        })
      }
    } catch (error) {
      console.error("Error loading analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
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
                <h1 className="text-xl font-semibold text-gray-900">Case Analytics</h1>
                <p className="text-sm text-gray-600">Performance metrics and case insights</p>
              </div>
            </div>
            <div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resolvedCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Resolution Time</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgResolutionTime} hrs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cases">Case Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Cases by Type
                  </CardTitle>
                  <CardDescription>Distribution of cases by crime type</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {Object.keys(stats.casesByType).length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">No data available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(stats.casesByType).map(([type, count]) => (
                        <div key={type} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium capitalize">{type.replace("_", " ")}</span>
                            <span className="text-sm text-gray-600">{count} cases</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{
                                width: `${(count / stats.totalCases) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Cases by Priority
                  </CardTitle>
                  <CardDescription>Distribution of cases by priority level</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {Object.keys(stats.casesByPriority).length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">No data available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(stats.casesByPriority).map(([priority, count]) => (
                        <div key={priority} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium capitalize">{priority}</span>
                            <span className="text-sm text-gray-600">{count} cases</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                priority === "urgent"
                                  ? "bg-red-600"
                                  : priority === "high"
                                    ? "bg-orange-500"
                                    : priority === "medium"
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                              }`}
                              style={{
                                width: `${(count / stats.totalCases) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Case Timeline
                </CardTitle>
                <CardDescription>Cases reported over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {Object.keys(stats.casesByDay).length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No data available</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Timeline visualization will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Map className="h-5 w-5 mr-2" />
                  Case Heatmap
                </CardTitle>
                <CardDescription>Geographic distribution of cases</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <div className="text-center py-8">
                  <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Map visualization will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Your case resolution performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Case Resolution Rate</span>
                      <span className="text-sm font-medium">
                        {stats.totalCases > 0 ? Math.round((stats.resolvedCases / stats.totalCases) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{
                          width: `${
                            stats.totalCases > 0 ? Math.round((stats.resolvedCases / stats.totalCases) * 100) : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Average Response Time</span>
                      <span className="text-sm font-medium">4.2 hours</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Citizen Satisfaction</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
