"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { AnyCnameRecord } from "node:dns"

export function RecentCases() {
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentCases() {
      try {
        const response = await fetch("/api/cases?limit=5")
        const data = await response.json()

        if (data.success && Array.isArray(data.cases)) {
          // Extra defensive filtering to ensure everything in the array is an object
          setCases(data.cases.filter((c:any) => c && typeof c === "object" && c.id))
        }
      } catch (error) {
        console.error("Failed to fetch recent cases:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentCases()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "under_investigation": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-green-100 text-green-800"
      case "closed": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-green-100 text-green-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "high": return "bg-orange-100 text-orange-800"
      case "critical": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!Array.isArray(cases) || cases.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No recent cases found</div>
  }

  return (
    <div className="space-y-4">
      {cases.map((caseItem) => {
        // Double check item health
        if (!caseItem || !caseItem.id) return null

        // Defensive lookup resolution:
        // We evaluate every single potential object path safely using optional chaining.
        const caseNumber = caseItem?.case_number ?? "N/A"
        const title = caseItem?.title ?? "Untitled Case"
        
        // This covers variations like caseItem.police_station or caseItem.stations
        const stationName = caseItem?.police_station?.name ?? caseItem?.station?.name ?? "Unassigned Station"
        
        const rawStatus = caseItem?.status ?? ""
        const rawPriority = caseItem?.priority ?? ""
        
        let formattedDate = "Unknown date"
        if (caseItem?.created_at) {
          try {
            formattedDate = formatDistanceToNow(new Date(caseItem.created_at), { addSuffix: true })
          } catch (e) {
            console.error("Date parsing error:", e)
          }
        }

        return (
          <div key={caseItem.id} className="space-y-2 border-b border-muted pb-3 last:border-0 last:pb-0">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {caseNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  {title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stationName} • {formattedDate}
                </p>
              </div>
              
              <div className="flex flex-col gap-1 items-end">
                <Badge className={getStatusColor(rawStatus)} variant="secondary">
                  {rawStatus ? rawStatus.replace("_", " ") : "unknown"}
                </Badge>
                <Badge className={getPriorityColor(rawPriority)} variant="secondary">
                  {rawPriority || "unknown"}
                </Badge>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}