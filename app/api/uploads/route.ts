import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// Upload a file
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const formData = await request.formData()
    const file = formData.get("file") as File
    const caseId = formData.get("case_id") as string
    const fileType = (formData.get("file_type") as string) || "evidence"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
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

    // Generate file path
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${caseId ? `cases/${caseId}` : "general"}/${fileType}/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("clearcase-files")
      .upload(filePath, file)

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 })
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from("clearcase-files").getPublicUrl(filePath)

    // Create file record in database
    const { data: fileRecord, error: fileRecordError } = await supabase
      .from("files")
      .insert({
        file_name: file.name,
        file_path: filePath,
        file_type: fileType,
        file_size: file.size,
        mime_type: file.type,
        case_id: caseId || null,
        uploaded_by: userProfile.id,
        public_url: publicUrlData.publicUrl,
      })
      .select()
      .single()

    if (fileRecordError) {
      return NextResponse.json({ error: fileRecordError.message }, { status: 400 })
    }

    // If this is for a case, update the case's evidence_files array
    if (caseId) {
      await supabase.rpc("append_evidence_file", {
        case_id: caseId,
        file_id: fileRecord.id,
      })

      // Create case update
      await supabase.from("case_updates").insert({
        case_id: caseId,
        updated_by: userProfile.id,
        update_type: "evidence_added",
        message: `New evidence file "${file.name}" was added by ${userProfile.full_name}`,
      })
    }

    return NextResponse.json({
      message: "File uploaded successfully",
      file: fileRecord,
    })
  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
