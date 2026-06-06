import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies(); // Await cookies to get ReadonlyRequestCookies
    const supabase = createServerClient({
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: any) => cookieStore.set(name, value, options),
      remove: (name: string, options: any) => cookieStore.delete({ name, ...options }),
    });
    const { id } = await params;

    const { data: station, error } = await supabase
      .from('police_stations')
      .select(`
        *,
        cases:cases(
          id,
          case_number,
          title,
          status,
          priority,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    return NextResponse.json({ station, success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies(); // Await cookies to get ReadonlyRequestCookies
    const supabase = createServerClient({
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: any) => cookieStore.set(name, value, options),
      remove: (name: string, options: any) => cookieStore.delete({ name, ...options }),
    });
    const { id } = await params;
    const body = await request.json();

    const { data: updatedStation, error } = await supabase
      .from('police_stations')
      .update({
        name: body.name,
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
        status: body.status,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Police station updated successfully',
      station: updatedStation,
      success: true,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies(); // Await cookies to get ReadonlyRequestCookies
    const supabase = createServerClient({
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: any) => cookieStore.set(name, value, options),
      remove: (name: string, options: any) => cookieStore.delete({ name, ...options }),
    });
    const { id } = await params;

    const { error } = await supabase.from('police_stations').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Police station deleted successfully',
      success: true,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}