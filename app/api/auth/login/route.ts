import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("id, full_name, email, role, is_active, station_id")
      .eq("auth_user_id", data.user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    if (!userProfile.is_active) {
      return NextResponse.json(
        { error: "Your account is pending approval. Please wait for admin activation." },
        { status: 403 }
      );
    }
    
    const response = NextResponse.json(
      { success: true, user: { ...data.user, ...userProfile } },
      { status: 200 }
    );

    // If your utility '@utils/supabase/server' uses standard Next.js Server Actions/Route Handlers middleware pattern,
    // you need to explicitly make sure the set-cookies headers from your server client are attached to this specific response.
    if (data.session) {
      // If your createClient implementation requires manual header syncing:
      // response.headers.set('set-cookie', ... );
      
      // Note: If you are using standard Supabase SSR package recommended configuration,
      // creating the client automatically mutates the standard Next.JS cookies store.
      // But if your dashboard is loading infinitely, ensure your middleware.ts is watching your dashboard routes!
    }

    return response;

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}