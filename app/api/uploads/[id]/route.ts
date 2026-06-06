import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// Get file details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Get file details
    const { data: file, error: fileError } = await supabase
      .from("files")
      .select(
        `
        *,
        uploaded_by_user:users(full_name, role)
      `,
      )
      .eq("id", id)
      .single()

    if (fileError) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Get user profile
    const { data: userProfile } = await supabase.from("users").select("*").eq("clerk_id", user.id).single()

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Check if user has access to this file
    if (file.case_id) {
      const { data: caseData } = await supabase.from("cases").select("*").eq("id", file.case_id).single()

      const isAdmin = userProfile.role === "admin"
      const isAssignedOfficer = caseData?.assigned_officer_id === userProfile.id
      const isReporter = caseData?.reporter_id === userProfile.id
      const isPoliceFromSameStation =
        userProfile.role === "police" && userProfile.station_id === caseData?.assigned_station_id

      if (!(isAdmin || isAssignedOfficer || isReporter || isPoliceFromSameStation)) {
        return NextResponse.json({ error: "Unauthorized to access this file" }, { status: 403 })
      }
    }

    // Generate a signed URL for the file (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("clearcase-files")
      .createSignedUrl(file.file_path, 3600)

    if (signedUrlError) {
      return NextResponse.json({ error: signedUrlError.message }, { status: 400 })
    }

    return NextResponse.json({
      file: {
        ...file,
        signed_url: signedUrlData.signedUrl,
      },
    })
  } catch (error) {
    console.error("File fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a file
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

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Get file details
    const { data: file, error: fileError } = await supabase.from("files").select("*").eq("id", id).single()

    if (fileError) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Check permissions
    const isAdmin = userProfile.role === "admin"
    const isUploader = file.uploaded_by === userProfile.id

    if (!(isAdmin || isUploader)) {
      return NextResponse.json({ error: "Unauthorized to delete this file" }, { status: 403 })
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage.from("clearcase-files").remove([file.file_path])

    if (storageError) {
      return NextResponse.json({ error: storageError.message }, { status: 400 })
    }

    // If this is for a case, update the case's evidence_files array
    if (file.case_id) {
      await supabase.rpc("remove_evidence_file", {
        case_id: file.case_id,
        file_id: file.id,
      })

      // Create case update
      await supabase.from("case_updates").insert({
        case_id: file.case_id,
        updated_by: userProfile.id,
        update_type: "evidence_removed",
        message: `Evidence file "${file.file_name}" was removed by ${userProfile.full_name}`,
      })
    }

    // Delete from database
    const { error: deleteError } = await supabase.from("files").delete().eq("id", id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({ message: "File deleted successfully" })
  } catch (error) {
    console.error("File deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
