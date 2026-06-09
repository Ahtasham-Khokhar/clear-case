export const dynamic = "force-dynamic"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RecentCasesLoader from "@/components/admin/recent-cases-loader"

export default function AdminCasesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cases Management</h2>
        <p className="text-muted-foreground">Monitor and manage all reported cases</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Cases</CardTitle>
          <CardDescription>Recent cases reported across all police stations</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentCasesLoader />
        </CardContent>
      </Card>
    </div>
  )
}
