import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";

export async function POST(req: Request) {
  console.log("=== REGISTER API CALLED ===");
  
  try {
    // Validate environment variables first
    console.log("Checking environment variables...");
    const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_APP_URL'];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    
    if (missingVars.length > 0) {
      console.error("Missing environment variables:", missingVars);
      return NextResponse.json(
        { success: false, error: `Missing environment variables: ${missingVars.join(', ')}` },
        { status: 500 }
      );
    }
    
    console.log("Environment variables loaded:", {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***' : 'MISSING'
    });

    console.log("Initializing register endpoint...");
    
    // Get cookies
    let cookieStore;
    try {
      cookieStore = await cookies();
      console.log("Cookies initialized");
    } catch (err) {
      console.error("Failed to get cookies:", err);
      return NextResponse.json(
        { success: false, error: "Failed to initialize session" },
        { status: 500 }
      );
    }

    // Create Supabase client
    let supabase;
    try {
      supabase = createServerClient({
        get: (name: string) => {
          try {
            const value = cookieStore.get(name)?.value;
            return value || undefined;
          } catch (e) {
            console.error(`Error getting cookie ${name}:`, e);
            return undefined;
          }
        },
        set: (name: string, value: string, options: CookieOptions) => {
          try {
            cookieStore.set({
              name,
              value,
              ...options,
              path: options.path || '/',
            });
          } catch (e) {
            console.error(`Error setting cookie ${name}:`, e);
          }
        },
        remove: (name: string, options: CookieOptions) => {
          try {
            cookieStore.set({
              name,
              value: '',
              ...options,
              path: options.path || '/',
              expires: new Date(0),
            });
          } catch (e) {
            console.error(`Error removing cookie ${name}:`, e);
          }
        }
      });
      console.log("Supabase client created successfully");
    } catch (err) {
      console.error("Failed to create Supabase client:", err);
      return NextResponse.json(
        { success: false, error: "Failed to initialize database connection" },
        { status: 500 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("Request body parsed:", { email: body.email, full_name: body.full_name, role: body.role });
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { email, password, full_name, phone, role, badge_number, station_id } = body;

    // Validate required fields
    if (!email || !password || !full_name || !role) {
      console.error("Missing required fields:", { email: !!email, password: !!password, full_name: !!full_name, role: !!role });
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Sign up with Supabase Auth
    console.log("Attempting signup for email:", email);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          full_name,
          role,
        },
      },
    });

    if (authError) {
      console.error("Supabase auth signup error:", authError.message);
      return NextResponse.json(
        { success: false, error: authError.message || "Signup failed" },
        { status: 400 }
      );
    }

    if (!authData.user) {
      console.error("No user returned from signup");
      return NextResponse.json(
        { success: false, error: "No user returned from signup" },
        { status: 400 }
      );
    }

    const authUserId = authData.user.id;
    console.log("User signed up with ID:", authUserId);

    // Insert user profile into database
    console.log("Creating user profile in database...");
    const { error: dbError } = await supabase
      .from("users")
      .insert([
        {
          auth_user_id: authUserId,
          email,
          full_name,
          phone: phone || null,
          role,
          badge_number: role === "police" ? badge_number : null,
          station_id: role === "police" ? station_id : null,
          is_active: role === "admin" ? true : role === "police" ? false : true,
        }
      ]);

    if (dbError) {
      console.error("Database insert error:", dbError.message);
      // Try to delete the auth user since DB insert failed
      try {
        await supabase.auth.admin.deleteUser(authUserId);
        console.log("Cleaned up auth user due to DB error");
      } catch (deleteError) {
        console.error("Failed to delete auth user:", deleteError);
      }
      return NextResponse.json(
        { success: false, error: `Database error: ${dbError.message}` },
        { status: 400 }
      );
    }

    console.log("User registration completed successfully");
    
    if (role === "police") {
      console.log("Police officer registration pending approval:", email);
    }

    return NextResponse.json({ success: true, role });
    
  } catch (error: any) {
    console.error("=== CRITICAL ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}