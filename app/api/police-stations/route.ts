import { type NextRequest, NextResponse } from "next/server"
import { cookies } from 'next/headers';
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies(); // Await cookies to get ReadonlyRequestCookies
    const supabase = createServerClient({
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: any) => cookieStore.set(name, value, options),
      remove: (name: string, options: any) => cookieStore.delete({ name, ...options }),
    });
    const { searchParams } = new URL(request.url)

    let query = supabase.from("police_stations").select(`
        *,
        cases:cases(count)
      `)

    // Apply filters
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const city = searchParams.get("city")
    const limit = searchParams.get("limit")
    const offset = searchParams.get("offset")

    if (search) {
      query = query.or(`name.ilike.%${search}%,station_code.ilike.%${search}%,city.ilike.%${search}%`)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (city) {
      query = query.eq("city", city)
    }

    // Pagination
    if (limit) {
      const limitNum = Number.parseInt(limit)
      const offsetNum = offset ? Number.parseInt(offset) : 0
      query = query.range(offsetNum, offsetNum + limitNum - 1)
    }

    query = query.order("created_at", { ascending: false })

    const { data: stations, error, count } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase.from("police_stations").select("*", { count: "exact", head: true })

    return NextResponse.json({
      stations: stations || [],
      total: totalCount || 0,
      success: true,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies(); // Await cookies to get ReadonlyRequestCookies
    const supabase = createServerClient({
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: any) => cookieStore.set(name, value, options),
      remove: (name: string, options: any) => cookieStore.delete({ name, ...options }),
    });
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["name", "station_code", "address", "city", "state", "postal_code", "phone", "email"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            error: `Missing required field: ${field}`,
          },
          { status: 400 },
        )
      }
    }

    // Check if station code already exists
    const { data: existingStation } = await supabase
      .from("police_stations")
      .select("id")
      .eq("station_code", body.station_code)
      .single()

    if (existingStation) {
      return NextResponse.json(
        {
          error: "Station code already exists",
        },
        { status: 409 },
      )
    }

    const { data: newStation, error: insertError } = await supabase
      .from("police_stations")
      .insert({
        name: body.name,
        station_code: body.station_code,
        address: body.address,
        city: body.city,
        state: body.state,
        postal_code: body.postal_code,
        phone: body.phone,
        email: body.email,
        jurisdiction: body.jurisdiction,
        latitude: body.latitude ? Number.parseFloat(body.latitude) : null,
        longitude: body.longitude ? Number.parseFloat(body.longitude) : null,
        logo_url: body.logo_url,
        officer_in_charge: body.officer_in_charge,
        officer_contact: body.officer_contact,
        established_date: body.established_date,
        status: body.status || "active",
      })
      .select()
      .single()

    if (insertError) {
      console.error("Insert error:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        message: "Police station created successfully",
        station: newStation,
        success: true,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}