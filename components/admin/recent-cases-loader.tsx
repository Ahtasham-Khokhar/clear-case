"use client"

import nextDynamic from "next/dynamic"

const RecentCases = nextDynamic(() => import("@/components/admin/recent-cases"), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
        </div>
      ))}
    </div>
  ),
})

export default function RecentCasesLoader() {
  return <RecentCases />
}
