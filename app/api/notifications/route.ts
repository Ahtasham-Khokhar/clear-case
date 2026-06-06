import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import type { CookieOptions } from "@supabase/ssr"

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

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "20"
    const unreadOnly = searchParams.get("unread_only") === "true"

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userProfile.id)
      .order("created_at", { ascending: false })
      .limit(Number.parseInt(limit))

    if (unreadOnly) {
      query = query.eq("is_read", false)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Query error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: notifications })
  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const { data: userProfile } = await supabase.from("users").select("*").eq("auth_user_id", user.id).single()

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Mark notifications as read
    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userProfile.id)
      .in("id", body.notification_ids || [])

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ message: "Notifications marked as read" })
  } catch (error) {
    console.error("Notifications update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
