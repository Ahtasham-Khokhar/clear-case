'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, FileText, CheckCircle } from "lucide-react"
import DashboardStats from "@/components/dashboard-stats"
import { RecentCases } from "@/components/admin/recent-cases"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your police management system</p>
      </div>

      <DashboardStats/>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
            <CardDescription>Latest cases reported across all stations</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentCases />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">All systems operational</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Database connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Backup scheduled</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
