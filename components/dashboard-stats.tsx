"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, FileText, AlertTriangle, CheckCircle } from "lucide-react"

interface Stats {
  totalStations: number
  totalCases: number
  pendingCases: number
  completedCases: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalStations: 0,
    totalCases: 0,
    pendingCases: 0,
    completedCases: 0,
  })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function fetchStats() {
      try {
        const [stationsRes, casesRes] = await Promise.all([
          fetch("/api/police-stations"),
          fetch("/api/cases"),
        ])

        const stationsData = await stationsRes.json()
        const casesData = await casesRes.json()

        if (stationsData.success && casesData.success) {
          const pendingCases = casesData.cases.filter((c: any) => c.status === "pending").length
          const completedCases = casesData.cases.filter((c: any) => c.status === "completed").length

          setStats({
            totalStations: stationsData.stations.length,
            totalCases: casesData.cases.length,
            pendingCases,
            completedCases,
          })
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Stations",
      value: stats.totalStations,
      icon: Building2,
      color: "text-blue-600",
    },
    {
      title: "Total Cases",
      value: stats.totalCases,
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "Pending Cases",
      value: stats.pendingCases,
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      title: "Completed Cases",
      value: stats.completedCases,
      icon: CheckCircle,
      color: "text-green-600",
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon // Ensure icon is a valid component
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}