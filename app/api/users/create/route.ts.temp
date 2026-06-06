import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()

  console.log("This is API of users")

  const { email, password, full_name, role } = body

  if (!email || !password || !full_name || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { role, full_name },
  })

  if (authError || !authUser?.user?.id) {
    return NextResponse.json({ error: authError?.message || "Auth creation failed" }, { status: 400 })
  }

  const user_id = authUser.user.id

  const { error: userError } = await supabase.from("users").insert([
    { id: user_id, full_name, email, role },
  ])

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 400 })
  }

  // Insert into role-specific tables
  let roleInsertResult

  if (role === "Citizen") {
    const { phone, address } = body
    if (!phone || !address) {
      return NextResponse.json({ error: "Missing phone or address" }, { status: 400 })
    }

    roleInsertResult = await supabase.from("citizens").insert([
      { user_id, full_name, email, phone, address },
    ])
  }

  if (role === "Police") {
    const { badge_number, station_id } = body
    if (!badge_number || !station_id) {
      return NextResponse.json({ error: "Missing badge number or station ID" }, { status: 400 })
    }

    roleInsertResult = await supabase.from("police_officers").insert([
      { user_id, full_name, email, badge_number, station_id },
    ])
  }

  if (role === "Admin") {
    const { admin_code } = body
    if (!admin_code) {
      return NextResponse.json({ error: "Missing admin code" }, { status: 400 })
    }

    roleInsertResult = await supabase.from("admins").insert([
      { user_id, full_name, email, admin_code },
    ])
  }

  if (roleInsertResult?.error) {
    return NextResponse.json({ error: roleInsertResult.error.message }, { status: 400 })
  }

  return NextResponse.json({ message: `${role} created successfully.` }, { status: 200 })
}
