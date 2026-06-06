import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
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

    // Get the user's session
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      // If there's no session, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Get the user's profile
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", session.user.id)
      .single()

    if (!profile) {
      // If there's no profile, redirect to complete registration
      return NextResponse.redirect(new URL('/complete-profile', request.url))
    }

    // Continue with the request
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - register (registration page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register).*)',
  ],
} 