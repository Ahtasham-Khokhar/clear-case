"use client"

import { getSupabaseClient } from "./supabase"
import type { Case } from "./database.types"

export interface CaseFilters {
  status?: string
  priority?: string
  case_type?: string
  limit?: number
  offset?: number
  reporter_id?: string
  citizen_id?: string
  assigned_officer_id?: string
  assigned_station_id?: string
}

export interface NotificationFilters {
  limit?: number
  unread_only?: boolean
}

export interface UserFilters {
  role?: string
  is_active?: boolean
  limit?: number
  offset?: number
}

export interface OfficerFilters {
  station_id?: string
  is_active?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface StationFilters {
  search?: string
  limit?: number
  offset?: number
}

class ApiClient {
  private baseUrl = "/api"

  private async getAuthHeaders() {
    const supabase = getSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`
    }

    return headers
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      const headers = await this.getAuthHeaders()

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        credentials: "include", // Include cookies for session handling
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Cases API
  async getCases(params?: CaseFilters) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return this.request(`/cases?${searchParams.toString()}`)
  }

  async getCase(id: string) {
    try {
      const data = await this.request(`/cases/${id}`)
      
      // Validate response structure
      if (!data || !data.case) {
        throw new Error('Invalid response: Missing case data')
      }
      
      return {
        case: data.case,
        updates: data.updates || []
      }
    } catch (error) {
      console.error(`Error fetching case ${id}:`, error)
      throw error
    }
  }

  async createCase(caseData: Partial<Case>) {
    return this.request("/cases", {
      method: "POST",
      body: JSON.stringify(caseData),
    })
  }

  async updateCase(id: string, updates: Partial<Case>) {
    return this.request(`/cases/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  async deleteCase(id: string) {
    return this.request(`/cases/${id}`, {
      method: "DELETE",
    })
  }

  async addCaseUpdate(caseId: string, update: any) {
    return this.request(`/cases/${caseId}/updates`, {
      method: "POST",
      body: JSON.stringify(update),
    })
  }

  // Notifications API
  async getNotifications(params?: NotificationFilters) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return this.request(`/notifications?${searchParams.toString()}`)
  }

  async markNotificationsAsRead(notificationIds: string[]) {
    return this.request("/notifications", {
      method: "PUT",
      body: JSON.stringify({ notification_ids: notificationIds }),
    })
  }

  // Users API
  async getUsers(params?: UserFilters) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return this.request(`/users?${searchParams.toString()}`)
  }

  async updateUser(id: string, updates: any) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  // Officers API
  async getOfficers(params?: OfficerFilters) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return this.request(`/officers?${searchParams.toString()}`)
  }

  async getOfficer(id: string) {
    return this.request(`/officers/${id}`)
  }

  async createOfficer(officerData: any) {
    return this.request("/officers", {
      method: "POST",
      body: JSON.stringify(officerData),
    })
  }

  async updateOfficer(id: string, updates: any) {
    return this.request(`/officers/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  async deleteOfficer(id: string) {
    return this.request(`/officers/${id}`, {
      method: "DELETE",
    })
  }

  // Stations API
  async getStations(params?: StationFilters) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return this.request(`/stations?${searchParams.toString()}`)
  }

  async getStation(id: string) {
    return this.request(`/stations/${id}`)
  }

  async createStation(stationData: any) {
    return this.request("/stations", {
      method: "POST",
      body: JSON.stringify(stationData),
    })
  }

  async updateStation(id: string, updates: any) {
    return this.request(`/stations/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  async deleteStation(id: string) {
    return this.request(`/stations/${id}`, {
      method: "DELETE",
    })
  }

  // Analytics API
  async getAnalytics(timeframe = "30d") {
    return this.request(`/analytics?timeframe=${timeframe}`)
  }

  // File Upload API
  async uploadFile(file: File, caseId?: string, fileType = "evidence") {
    const formData = new FormData()
    formData.append("file", file)
    if (caseId) formData.append("case_id", caseId)
    formData.append("file_type", fileType)

    const headers = await this.getAuthHeaders()
    const headersWithoutContentType = { ...headers }
    delete (headersWithoutContentType as { [key: string]: any })["Content-Type"] // Let the browser set this for FormData

    const response = await fetch(`${this.baseUrl}/uploads`, {
      method: "POST",
      headers: headersWithoutContentType,
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Upload failed" }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async getFile(id: string) {
    return this.request(`/uploads/${id}`)
  }

  async deleteFile(id: string) {
    return this.request(`/uploads/${id}`, {
      method: "DELETE",
    })
  }

  // Chat API
  async getChatMessages(caseId: string) {
    return this.request(`/chat?case_id=${caseId}`)
  }

  async sendChatMessage(caseId: string, message: string) {
    return this.request("/chat", {
      method: "POST",
      body: JSON.stringify({ case_id: caseId, message }),
    })
  }

  // Settings API
  async getSettings() {
    return this.request("/settings")
  }

  async updateSettings(settings: Record<string, any>) {
    return this.request("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    })
  }

  // Reports API
  async generateReport(params: {
    type: "cases" | "officers" | "stations"
    start_date: string
    end_date: string
    format?: "json" | "csv"
  }) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    if (params.format === "csv") {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseUrl}/reports?${searchParams.toString()}`, {
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Report generation failed" }))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return response.blob()
    }

    return this.request(`/reports?${searchParams.toString()}`)
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient()