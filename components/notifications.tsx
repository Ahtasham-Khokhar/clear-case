"use client"

import { useState, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, Trash2 } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import Link from "next/link"

const NotificationItem = memo(({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: { 
  notification: any
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}) => (
  <div
    className={`p-4 hover:bg-accent transition-colors ${
      !notification.is_read ? "bg-accent/50" : ""
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1">
        <p className="font-medium text-sm">{notification.title}</p>
        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
        <div className="flex items-center gap-2 mt-2">
          <time className="text-xs text-muted-foreground">
            {new Date(notification.created_at).toLocaleDateString()}
          </time>
          {notification.case_id && (
            <Link
              href={`/cases/${notification.case_id}`}
              className="text-xs text-primary hover:underline"
            >
              View Case
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMarkAsRead(notification.id)}
            className="h-8 w-8"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(notification.id)}
          className="h-8 w-8 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
))
NotificationItem.displayName = "NotificationItem"

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    await markAsRead(notificationId)
  }, [markAsRead])

  const handleDelete = useCallback(async (notificationId: string) => {
    await deleteNotification(notificationId)
  }, [deleteNotification])

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead()
  }, [markAllAsRead])

  const handleBackdropClick = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={toggleOpen}
        aria-label="Toggle notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleBackdropClick} />
          <Card className="absolute right-0 top-12 z-50 w-96 shadow-lg">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b p-4">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                    <Check className="h-4 w-4 mr-2" />
                    Mark all as read
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[400px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <Bell className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 