import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", session.user.id)
      .single()

    if (profileError || !userProfile) {
      console.error('Profile error:', profileError)
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)

    // ✅ FIX: Remove police_station embedding - fetch separately instead
    let query = supabase.from("cases").select(`
      *,
      citizen:users!cases_citizen_id_fkey(id, full_name, email, phone),
      reporter:users!cases_reporter_id_fkey(id, full_name, email, phone),
      assigned_officer:users!cases_assigned_officer_id_fkey(id, full_name, badge_number)
    `, { count: "exact" })

    // Role-based filtering
    if (userProfile.role === "citizen") {
      query = query.eq("citizen_id", userProfile.id)
    } else if (userProfile.role === "police") {
      query = query.or(`assigned_officer_id.eq.${userProfile.id},police_station_id.eq.${userProfile.station_id}`)
    }

    // Filtering
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const caseType = searchParams.get("case_type")
    const stationId = searchParams.get("station_id")
    const limit = searchParams.get("limit")
    const offset = searchParams.get("offset")

    if (search) {
      query = query.or(`case_number.ilike.%${search}%,title.ilike.%${search}%,complainant_name.ilike.%${search}%`)
    }
    if (status) query = query.eq("status", status)
    if (priority) query = query.eq("priority", priority)
    if (caseType) query = query.eq("case_type", caseType)
    if (stationId) query = query.eq("police_station_id", stationId)

    if (limit) {
      const l = parseInt(limit)
      const o = offset ? parseInt(offset) : 0
      query = query.range(o, o + l - 1)
    }

    query = query.order("created_at", { ascending: false })

    const { data: cases, error, count: totalCount } = await query

    if (error) {
      console.error('Query error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // ✅ NEW: Fetch police stations separately and merge
    if (cases && cases.length > 0) {
      const stationIds = [...new Set(cases.map((c: any) => c.police_station_id).filter(Boolean))]
      
      if (stationIds.length > 0) {
        const { data: stations, error: stationError } = await supabase
          .from("police_stations")
          .select("id, name, station_code, phone, address")
          .in("id", stationIds)

        if (!stationError && stations) {
          const stationsMap = new Map(stations.map(s => [s.id, s]))
          const enrichedCases = cases.map(c => ({
            ...c,
            police_station: stationsMap.get(c.police_station_id) || null
          }))

          return NextResponse.json({ 
            cases: enrichedCases, 
            total: totalCount || 0, 
            success: true 
          })
        }
      }
    }

    return NextResponse.json({ 
      cases: cases || [], 
      total: totalCount || 0, 
      success: true 
    })
  } catch (error) {
    console.error("Cases fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient()
    const body = await request.json()

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", session.user.id)
      .single()

    if (profileError || !userProfile) {
      console.error('Profile error:', profileError)
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    const caseNumber = `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const { data: newCase, error: caseError } = await supabase
      .from("cases")
      .insert({
        case_number: caseNumber,
        title: body.title,
        description: body.description,
        case_type: body.case_type,
        priority: body.priority || "medium",
        status: body.status || "pending",
        police_station_id: body.police_station_id || userProfile.station_id || null,
        assigned_officer_id: body.assigned_officer_id,
        citizen_id: userProfile.id,
        reporter_id: userProfile.id,
        reporter_phone: body.reporter_phone,
        reporter_address: body.reporter_address,
        complainant_name: body.complainant_name,
        complainant_contact: body.complainant_contact,
        incident_date: body.incident_date,
        incident_location: body.incident_location,
        incident_latitude: body.incident_latitude,
        incident_longitude: body.incident_longitude,
        witness_details: body.witness_details,
        evidence_files: body.evidence_files || [],
      })
      .select()
      .single()

    if (caseError) {
      console.error('Case creation error:', caseError)
      return NextResponse.json({ error: caseError.message }, { status: 400 })
    }

    const { error: notificationError } = await supabase.from("notifications").insert({
      user_id: userProfile.id,
      case_id: newCase.id,
      title: "Case Report Submitted",
      message: `Your case \"${body.title}\" has been submitted successfully. Case number: ${caseNumber}`,
      type: "case_created",
    })

    if (notificationError) {
      console.error('Notification creation error:', notificationError)
    }

    return NextResponse.json({
      message: "Case created successfully",
      data: newCase,
      success: true,
    }, { status: 201 })
  } catch (error) {
    console.error("Case creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
