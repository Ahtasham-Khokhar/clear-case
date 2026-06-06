"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import type { ChatMessage } from "@/lib/supabase"

export function useChat(caseId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getChatMessages(caseId)
      setMessages(response.messages)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch messages")
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (message: string) => {
    try {
      const response = await apiClient.sendChatMessage(caseId, message)
      setMessages((prev) => [...prev, response.chat_message])
      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message")
      return { success: false, error: err instanceof Error ? err.message : "Failed to send message" }
    }
  }

  useEffect(() => {
    if (caseId) {
      fetchMessages()
    }
  }, [caseId])

  // Listen for real-time updates
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const newMessage = event.detail
      if (newMessage.case_id === caseId) {
        setMessages((prev) => [...prev, newMessage])
      }
    }

    window.addEventListener("new_chat_message", handleNewMessage as EventListener)

    return () => {
      window.removeEventListener("new_chat_message", handleNewMessage as EventListener)
    }
  }, [caseId])

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages,
  }
}
