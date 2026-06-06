"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

interface Notification {
  id: string
  user_id: string
  case_id?: string
  title: string
  message: string
  type: "case_update" | "case_created" | "system"
  is_read: boolean
  created_at: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const subscriptionRef = useRef<any>(null)

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return

    try {
      const supabase = getSupabaseClient()
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter((n) => !n.is_read).length)
      }
    } catch (error) {
      console.error("Error loading notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const subscribeToNotifications = useCallback(() => {
    if (!user?.id) return

    const supabase = getSupabaseClient()
    
    subscriptionRef.current = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((current) => [payload.new as Notification, ...current])
          setUnreadCount((count) => count + 1)
        }
      )
      .subscribe()
  }, [user?.id])

  useEffect(() => {
    loadNotifications()
    subscribeToNotifications()

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [loadNotifications, subscribeToNotifications])

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return

    try {
      const supabase = getSupabaseClient()
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", user.id)

      setNotifications((current) =>
        current.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
      setUnreadCount((count) => Math.max(0, count - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }, [user?.id])

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return

    try {
      const supabase = getSupabaseClient()
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false)

      setNotifications((current) =>
        current.map((n) => ({ ...n, is_read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }, [user?.id])

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user?.id) return

    try {
      const supabase = getSupabaseClient()
      await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", user.id)

      setNotifications((current) =>
        current.filter((n) => n.id !== notificationId)
      )
      if (!notifications.find((n) => n.id === notificationId)?.is_read) {
        setUnreadCount((count) => Math.max(0, count - 1))
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }, [user?.id, notifications])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}
