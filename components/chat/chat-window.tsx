"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, MessageCircle } from "lucide-react"
import { useChat } from "@/hooks/use-chat"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"

interface ChatWindowProps {
  caseId: string
  caseTitle: string
}

export function ChatWindow({ caseId, caseTitle }: ChatWindowProps) {
  const [message, setMessage] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { messages, loading, sendMessage } = useChat(caseId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const result = await sendMessage(message.trim())
    if (result.success) {
      setMessage("")
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsOpen(true)} className="rounded-full h-12 w-12 shadow-lg" size="icon">
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-96">
      <Card className="h-full flex flex-col shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Chat - {caseTitle}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-6 w-6 p-0">
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="text-center text-sm text-muted-foreground">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-2 text-sm ${
                      msg.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <div className="font-medium text-xs mb-1">
                      {msg.sender?.full_name}
                      <Badge variant="outline" className="ml-1 text-xs">
                        {msg.sender?.role}
                      </Badge>
                    </div>
                    <div>{msg.message}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {formatDistanceToNow(new Date(msg.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
