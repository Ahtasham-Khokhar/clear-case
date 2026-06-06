import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import type { CookieOptions } from "@supabase/ssr"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createServerClient({
      get: (name) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        cookieStore.set({
          name,
          value,
          ...options,
          path: '/',
        })
      },
      remove: (name: string, options: CookieOptions) => {
        cookieStore.set({
          name,
          value: '',
          ...options,
          path: '/',
          expires: new Date(0),
        })
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

    // Check permissions
    const isSelfUpdate = userProfile.id === id
    const isAdmin = userProfile.role === "admin"

    if (!isSelfUpdate && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("User update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
