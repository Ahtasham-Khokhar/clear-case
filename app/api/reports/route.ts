import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import type { CookieOptions } from "@supabase/ssr"

// Generate reports
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({
      get: (name) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        cookieStore.set({ name, value, ...options })
      },
      remove: (name: string, options: CookieOptions) => {
        cookieStore.delete(name)
      },
    })
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type") || "cases"
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const format = searchParams.get("format") || "json"

    // Get user from auth header
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: userProfile } = await supabase.from("users").select("*").eq("auth_user_id", user.id).single()

    if (!userProfile || (userProfile.role !== "admin" && userProfile.role !== "police")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate dates
    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start date and end date are required" }, { status: 400 })
    }

    let reportData: any = null

    switch (reportType) {
      case "cases":
        reportData = await generateCasesReport(supabase, startDate, endDate, userProfile)
        break
      case "officers":
        reportData = await generateOfficersReport(supabase, startDate, endDate, userProfile)
        break
      case "stations":
        reportData = await generateStationsReport(supabase, startDate, endDate, userProfile)
        break
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    if (format === "csv") {
      // Convert to CSV
      const csv = convertToCSV(reportData)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${reportType}_report_${startDate}_to_${endDate}.csv"`,
        },
      })
    }

    return NextResponse.json({ report: reportData })
  } catch (error) {
    console.error("Report generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper functions for report generation
async function generateCasesReport(supabase: any, startDate: string, endDate: string, userProfile: any) {
  let query = supabase
    .from("cases")
    .select(
      `
      *,
      reporter:users!cases_reporter_id_fkey(full_name),
      assigned_officer:users!cases_assigned_officer_id_fkey(full_name, badge_number),
      assigned_station:police_stations(name)
    `,
    )
    .gte("created_at", startDate)
    .lte("created_at", endDate)

  // Apply role-based filtering
  if (userProfile.role === "police" && userProfile.station_id) {
    query = query.eq("assigned_station_id", userProfile.station_id)
  }

  const { data: cases, error } = await query.order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  // Process data for report
  return cases.map((case_: any) => ({
    case_number: case_.case_number,
    title: case_.title,
    case_type: case_.case_type,
    status: case_.status,
    priority: case_.priority,
    reporter: case_.reporter?.full_name || "Unknown",
    assigned_officer: case_.assigned_officer?.full_name || "Unassigned",
    assigned_station: case_.assigned_station?.name || "Unassigned",
    created_at: case_.created_at,
    resolved_at: case_.resolved_at || "N/A",
  }))
}

async function generateOfficersReport(supabase: any, startDate: string, endDate: string, userProfile: any) {
  if (userProfile.role !== "admin") {
    throw new Error("Only admins can generate officer reports")
  }

  const { data: officers, error } = await supabase
    .from("users")
    .select(
      `
      *,
      station:police_stations(name)
    `,
    )
    .eq("role", "police")
    .order("full_name", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  // Get case statistics for each officer
  const officerStats = []

  for (const officer of officers) {
    const { data: stats } = await supabase.rpc("get_officer_case_stats_in_period", {
      officer_id: officer.id,
      start_date: startDate,
      end_date: endDate,
    })

    officerStats.push({
      id: officer.id,
      full_name: officer.full_name,
      badge_number: officer.badge_number,
      rank: officer.rank,
      station: officer.station?.name || "Unassigned",
      is_active: officer.is_active ? "Active" : "Inactive",
      total_cases: stats?.total || 0,
      resolved_cases: stats?.resolved || 0,
      pending_cases: stats?.pending || 0,
      resolution_rate: stats?.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0,
    })
  }

  return officerStats
}

async function generateStationsReport(supabase: any, startDate: string, endDate: string, userProfile: any) {
  if (userProfile.role !== "admin") {
    throw new Error("Only admins can generate station reports")
  }

  const { data: stations, error } = await supabase
    .from("police_stations")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  // Get case statistics for each station
  const stationStats = []

  for (const station of stations) {
    const { data: stats } = await supabase.rpc("get_station_case_stats_in_period", {
      station_id: station.id,
      start_date: startDate,
      end_date: endDate,
    })

    // Get officer count
    const { count: officerCount } = await supabase
      .from("users")
      .select("*", { count: "exact" })
      .eq("station_id", station.id)
      .eq("role", "police")

    stationStats.push({
      id: station.id,
      name: station.name,
      address: station.address,
      jurisdiction: station.jurisdiction,
      officer_count: officerCount || 0,
      total_cases: stats?.total || 0,
      resolved_cases: stats?.resolved || 0,
      pending_cases: stats?.pending || 0,
      resolution_rate: stats?.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0,
    })
  }

  return stationStats
}

function convertToCSV(data: any[]) {
  if (!data || !data.length) return ""

  // Get headers from first object
  const headers = Object.keys(data[0])
  const headerRow = headers.join(",")

  // Convert each object to CSV row
  const rows = data.map((item) =>
    headers.map((header) => {
      const value = item[header]
      // Handle values that might contain commas
      return typeof value === "string" && value.includes(",") ? `"${value}"` : value
    }).join(","),
  )

  return [headerRow, ...rows].join("\n")
}
