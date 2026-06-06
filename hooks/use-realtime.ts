"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

export function useRealtime() {
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const supabase = getSupabaseClient()

    // Subscribe to case updates
    const caseChannel = supabase
      .channel("case_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cases",
        },
        (payload) => {
          console.log("Case update:", payload)
          // Trigger custom event for components to listen
          window.dispatchEvent(
            new CustomEvent("case_update", {
              detail: payload,
            }),
          )
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "case_updates",
        },
        (payload) => {
          console.log("Case update added:", payload)
          window.dispatchEvent(
            new CustomEvent("case_update_added", {
              detail: payload,
            }),
          )
        },
      )
      .subscribe()

    // Subscribe to notifications
    const notificationChannel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("New notification:", payload)
          window.dispatchEvent(
            new CustomEvent("new_notification", {
              detail: payload.new,
            }),
          )
        },
      )
      .subscribe()

    // Subscribe to chat messages
    const chatChannel = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          console.log("New chat message:", payload)
          window.dispatchEvent(
            new CustomEvent("new_chat_message", {
              detail: payload.new,
            }),
          )
        },
      )
      .subscribe()

    setIsConnected(true)

    return () => {
      supabase.removeChannel(caseChannel)
      supabase.removeChannel(notificationChannel)
      supabase.removeChannel(chatChannel)
      setIsConnected(false)
    }
  }, [user])

  return { isConnected }
}
