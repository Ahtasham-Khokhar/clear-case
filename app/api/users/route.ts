import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current user's profile to check if they are authorized
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", session.user.id)
      .single()

    if (profileError || !userProfile) {
      console.error('Profile error:', profileError)
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Only allow admin and police officers to query users
    if (userProfile.role !== "admin" && userProfile.role !== "police") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const isActive = searchParams.get("is_active")
    const limit = searchParams.get("limit")
    const offset = searchParams.get("offset")

    let query = supabase.from("users").select("*", { count: "exact" })

    if (role) {
      query = query.eq("role", role)
    }
    if (isActive !== null) {
      query = query.eq("is_active", isActive === "true")
    }

    if (limit) {
      const limitNum = Number.parseInt(limit)
      const offsetNum = offset ? Number.parseInt(offset) : 0
      query = query.range(offsetNum, offsetNum + limitNum - 1)
    }

    query = query.order("created_at", { ascending: false })

    const { data: users, error, count } = await query

    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      users: users || [],
      total: count || 0,
      success: true
    })
  } catch (error) {
    console.error("Users fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
