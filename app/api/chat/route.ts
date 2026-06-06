import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// Get chat messages for a case
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get("case_id")

    if (!caseId) {
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 })
    }

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

    // Check if user has access to this case
    const { data: caseData } = await supabase.from("cases").select("*").eq("id", caseId).single()

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const isAdmin = userProfile.role === "admin"
    const isAssignedOfficer = caseData.assigned_officer_id === userProfile.id
    const isReporter = caseData.reporter_id === userProfile.id
    const isPoliceFromSameStation =
      userProfile.role === "police" && userProfile.station_id === caseData.assigned_station_id

    if (!(isAdmin || isAssignedOfficer || isReporter || isPoliceFromSameStation)) {
      return NextResponse.json({ error: "Unauthorized to access this case" }, { status: 403 })
    }

    // Get chat messages
    const { data: messages, error: messagesError } = await supabase
      .from("chat_messages")
      .select(
        `
        *,
        sender:users(id, full_name, role)
      `,
      )
      .eq("case_id", caseId)
      .order("created_at", { ascending: true })

    if (messagesError) {
      return NextResponse.json({ error: messagesError.message }, { status: 400 })
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error("Chat messages fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Send a chat message
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { case_id, message } = body

    if (!case_id || !message) {
      return NextResponse.json({ error: "Case ID and message are required" }, { status: 400 })
    }

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

    // Check if user has access to this case
    const { data: caseData } = await supabase.from("cases").select("*").eq("id", case_id).single()

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const isAdmin = userProfile.role === "admin"
    const isAssignedOfficer = caseData.assigned_officer_id === userProfile.id
    const isReporter = caseData.reporter_id === userProfile.id
    const isPoliceFromSameStation =
      userProfile.role === "police" && userProfile.station_id === caseData.assigned_station_id

    if (!(isAdmin || isAssignedOfficer || isReporter || isPoliceFromSameStation)) {
      return NextResponse.json({ error: "Unauthorized to access this case" }, { status: 403 })
    }

    // Create chat message
    const { data: chatMessage, error: chatError } = await supabase
      .from("chat_messages")
      .insert({
        case_id,
        sender_id: userProfile.id,
        message,
      })
      .select()
      .single()

    if (chatError) {
      return NextResponse.json({ error: chatError.message }, { status: 400 })
    }

    // Create notification for other participants
    const notifyUsers = []

    // Always notify the reporter
    if (caseData.reporter_id !== userProfile.id) {
      notifyUsers.push(caseData.reporter_id)
    }

    // Notify assigned officer if exists and not the sender
    if (caseData.assigned_officer_id && caseData.assigned_officer_id !== userProfile.id) {
      notifyUsers.push(caseData.assigned_officer_id)
    }

    // Create notifications
    if (notifyUsers.length > 0) {
      const notifications = notifyUsers.map((userId) => ({
        user_id: userId,
        case_id,
        title: "New Message",
        message: `${userProfile.full_name} sent a message in case ${caseData.case_number}`,
        type: "chat_message",
      }))

      await supabase.from("notifications").insert(notifications)
    }

    return NextResponse.json({
      message: "Message sent successfully",
      chat_message: {
        ...chatMessage,
        sender: {
          id: userProfile.id,
          full_name: userProfile.full_name,
          role: userProfile.role,
        },
      },
    })
  } catch (error) {
    console.error("Chat message send error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
