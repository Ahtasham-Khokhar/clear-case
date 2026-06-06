import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", session.user.id)
      .single()

    if (profileError || !userProfile) {
      console.error('Profile error:', profileError)
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Get case details with role-based access control
    let query = supabase
      .from("cases")
      .select(`
        *,
        reporter:users!cases_reporter_id_fkey(full_name, phone, email),
        assigned_officer:users!cases_assigned_officer_id_fkey(full_name, badge_number),
        assigned_station:police_stations!cases_police_station_id_fkey(name, phone, address)
      `)
      .eq("id", id)

    // Apply role-based filtering
    if (userProfile.role === "citizen") {
      query = query.eq("citizen_id", userProfile.id)
    } else if (userProfile.role === "police") {
      query = query.or(`assigned_officer_id.eq.${userProfile.id},assigned_station_id.eq.${userProfile.station_id}`)
    }
    // Admin sees all cases

    const { data: caseData, error: caseError } = await query.single()

    if (caseError) {
      console.error('Case fetch error:', caseError)
      return NextResponse.json({ error: "Case not found or access denied" }, { status: 404 })
    }

    if (!caseData) {
      console.error('No case data found')
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Get case updates
    const { data: updates, error: updatesError } = await supabase
      .from("case_updates")
      .select(`
        *,
        updated_by_user:users!fk_case_updates_updated_by(full_name, role)
      `)
      .eq("case_id", id)
      .order("created_at", { ascending: false })

    if (updatesError) {
      console.error('Updates fetch error:', updatesError)
      // Don't fail the request if updates fetch fails
    }

    // Log successful response
    console.log('Returning case data:', {
      caseId: caseData.id,
      updatesCount: updates?.length || 0
    })

    return NextResponse.json({
      case: caseData,
      updates: updates || [],
    })
  } catch (error) {
    console.error("Case fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

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
    const { data: userProfile } = await supabase.from("users").select("*").eq("clerk_id", user.id).single()

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Get current case
    const { data: currentCase } = await supabase.from("cases").select("*").eq("id", id).single()

    if (!currentCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Update case
    const { data: updatedCase, error: updateError } = await supabase
      .from("cases")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
        resolved_at: body.status === "resolved" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // Create case update record if status changed
    if (body.status && body.status !== currentCase.status) {
      await supabase.from("case_updates").insert({
        case_id: id,
        updated_by: userProfile.id,
        update_type: "status_change",
        old_status: currentCase.status,
        new_status: body.status,
        message: `Status updated from ${currentCase.status} to ${body.status}`,
      })

      // Create notification for reporter
      await supabase.from("notifications").insert({
        user_id: currentCase.reporter_id,
        case_id: id,
        title: "Case Status Updated",
        message: `Your case "${currentCase.title}" status has been updated to ${body.status.replace("_", " ")}`,
        type: "case_update",
      })
    }

    return NextResponse.json({
      message: "Case updated successfully",
      case: updatedCase,
    })
  } catch (error) {
    console.error("Case update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

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
    const { data: userProfile } = await supabase.from("users").select("*").eq("clerk_id", user.id).single()

    if (!userProfile || userProfile.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    // Delete case (cascade will handle related records)
    const { error: deleteError } = await supabase.from("cases").delete().eq("id", id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({ message: "Case deleted successfully" })
  } catch (error) {
    console.error("Case deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
