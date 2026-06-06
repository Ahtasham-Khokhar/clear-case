"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient, type Case } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"

export function useCases() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.id) {  // Make sure we have user.id
      loadCases()
    }
  }, [user?.id])  // Depend on user.id specifically

  const loadCases = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID available')
        setError('User not authenticated')
        return
      }

      setLoading(true)
      setError(null)

      // First verify the session
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('No active session')
        setError('Session expired')
        return
      }

      // Use the API client to fetch cases
      const response = await apiClient.getCases({
        ...(user.role === "citizen" ? { reporter_id: user.id } : {}),
        ...(user.role === "police" ? { 
          assigned_officer_id: user.id,
          assigned_station_id: user.station_id 
        } : {})
      })

      setCases(response.data || [])
    } catch (err) {
      console.error('Failed to load cases:', err)
      setError(err instanceof Error ? err.message : "Failed to load cases")
    } finally {
      setLoading(false)
    }
  }

  const createCase = async (caseData: Partial<Omit<Case, "id" | "created_at">>) => {
    try {
      if (!user) throw new Error("User not authenticated")

      const response = await apiClient.createCase({
          ...caseData,
        case_number: `CASE-${Date.now()}`,
          reporter_id: user.id,
        citizen_id: user.id, // Since reporter is also the citizen
          status: "pending",
        })

      // Reload cases
      await loadCases()
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Failed to create case:', error)
      return { success: false, error: error instanceof Error ? error.message : "Failed to create case" }
    }
  }

  const updateCase = async (caseId: string, updates: Partial<Case>) => {
    try {
      await apiClient.updateCase(caseId, updates)
      // Reload cases
      await loadCases()
      return { success: true }
    } catch (error) {
      console.error('Failed to update case:', error)
      return { success: false, error: error instanceof Error ? error.message : "Failed to update case" }
    }
  }

  const deleteCase = async (caseId: string) => {
    try {
      await apiClient.deleteCase(caseId)
      // Reload cases
      await loadCases()
      return { success: true }
    } catch (error) {
      console.error('Failed to delete case:', error)
      return { success: false, error: error instanceof Error ? error.message : "Failed to delete case" }
    }
  }

  return {
    cases,
    loading,
    error,
    loadCases,
    createCase,
    updateCase,
    deleteCase,
  }
}
