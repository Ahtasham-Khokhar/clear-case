"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

interface Station {
  id: string
  name: string
  address: string
  phone: string
}

interface ExtendedUser {
  id: string
  auth_user_id: string
  email: string
  role: string
  full_name: string
  phone?: string
  badge_number?: string
  station_id?: string
  station?: Station | null
  is_active: boolean
  [key: string]: any
}

interface RegisterData {
  email: string
  password: string
  full_name: string
  role: string
  phone?: string
  badge_number?: string
  station_id?: string
}

interface AuthContextProps {
  authUser: User | null
  user: ExtendedUser | null
  loading: boolean
  error?: string
  register: (data: RegisterData) => Promise<{ success: boolean; role?: string; error?: string; message?: string }>
  login: (email: string, password: string) => Promise<{ success: boolean; user?: ExtendedUser; error?: string }>
  logout: () => Promise<void>
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextProps>({
  authUser: null,
  user: null,
  loading: true,
  register: async () => ({ success: false, error: "Not implemented" }),
  login: async () => ({ success: false, error: "Not implemented" }),
  logout: async () => {},
  isAdmin: () => false,
})

async function fetchUserProfile(supabase: ReturnType<typeof createClient>, authUserId: string): Promise<ExtendedUser | null> {
  const { data: userProfile, error: userError } = await supabase
    .from('users')
    .select('id, auth_user_id, email, full_name, role, phone, badge_number, station_id, is_active')
    .eq('auth_user_id', authUserId)
    .single()

  if (userError || !userProfile) {
    console.error('Failed to fetch user profile:', userError)
    return null
  }

  let station = null
  if (userProfile.station_id) {
    const { data: stationData, error: stationError } = await supabase
      .from('police_stations')
      .select('id, name, address, phone')
      .eq('id', userProfile.station_id)
      .single()

    if (!stationError && stationData) {
      station = stationData
    }
  }

  return { ...userProfile, station }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const supabase = createClient()

  const register = async (data: RegisterData) => {
    try {
      // 1. Call the server-side API to create the auth user + DB profile
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        let errorDetails = 'Unknown error'
        try {
          const errorBody = await response.json()
          errorDetails = errorBody.error || JSON.stringify(errorBody)
        } catch (e) {
          const errorText = await response.text()
          errorDetails = errorText || `HTTP ${response.status}`
        }
        console.error(`API returned ${response.status}:`, errorDetails)
        throw new Error(`Registration failed: ${errorDetails}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Registration failed')
      }

      // 2. After server-side registration, try to sign in on the client side
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        if (signInError.message?.includes('Email not confirmed') || 
            signInError.message?.includes('not confirmed')) {
          console.info('Registration successful. User must confirm email before login.')
          return { 
            success: true, 
            role: result.role,
            message: 'Please verify your email before logging in'
          }
        }
        console.warn('Auto-login after register failed:', signInError)
        return { success: true, role: result.role }
      }

      if (!authData.user) {
        return { success: true, role: result.role }
      }

      // 3. Fetch user profile metadata from DB
      const profile = await fetchUserProfile(supabase, authData.user.id)
      if (profile) {
        setAuthUser(authData.user)
        setUser(profile)
      }

      return { success: true, role: result.role }
    } catch (error) {
      console.error('Registration error handled:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (!authData.user) {
        throw new Error('No user returned from authentication')
      }

      const profile = await fetchUserProfile(supabase, authData.user.id)

      if (!profile) {
        throw new Error('User profile not found. Please contact support.')
      }

      setAuthUser(authData.user)
      setUser(profile)

      return { success: true, user: profile }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setAuthUser(null)
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        const { data: { user: authUserData }, error: userError } = await supabase.auth.getUser()

        if (userError || !authUserData) {
          setAuthUser(null)
          setUser(null)
          return
        }

        setAuthUser(authUserData)

        const profile = await fetchUserProfile(supabase, authUserData.id)
        if (profile) {
          setUser(profile)
        } else {
          setError('User profile not found')
        }
      } catch (err) {
        console.error('Auth check error:', err)
        setError(err instanceof Error ? err.message : 'Authentication error')
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setAuthUser(session.user)
          const profile = await fetchUserProfile(supabase, session.user.id)
          if (profile) {
            setUser(profile)
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthUser(null)
        setUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const isAdmin = () => user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ authUser, user, loading, error, register, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)