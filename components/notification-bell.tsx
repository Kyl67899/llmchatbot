"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bell, Check, Trash2, AlertCircle, Users, MessageSquare, Info } from "lucide-react"

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  type Notification,
  type NotificationType,
} from "@/lib/notifications"

import { cn } from "@/lib/utils"

interface NotificationBellProps {
  userId: string
  onNotificationUpdate?: () => void
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  credit_low: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  member_joined: <Users className="h-4 w-4 text-emerald-500" />,
  member_left: <Users className="h-4 w-4 text-muted-foreground" />,
  message: <MessageSquare className="h-4 w-4 text-blue-500" />,
  system: <Info className="h-4 w-4 text-muted-foreground" />,
};

export function NotificationBell({ userId, onNotificationUpdate }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  const [loading, setLoading] = useState(false)

  const loadNotifications = async () => {
    setLoading(true)
    const notifs = await getNotifications(userId)
    const count = await getUnreadCount(userId)
    setNotifications(notifs)
    setUnreadCount(count)
    setLoading(false)
  }

  useEffect(() => {
    loadNotifications()

    // Listen for new notifications
    const handleNotification = () => {
      loadNotifications()
      onNotificationUpdate?.()
    }

    window.addEventListener("notification", handleNotification)

    return () => {
      window.removeEventListener("notification", handleNotification)
    }
  }, [userId])

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(userId, notificationId)
    await loadNotifications()
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(userId)
    await loadNotifications()
  }

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(userId, notificationId)
    await loadNotifications()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-8 text-xs">
              Mark all as read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn("p-4 hover:bg-secondary/50 transition-colors", !notification.read && "bg-secondary/30")}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">{notificationIcons[notification.type] ?? <Info className="h-4 w-4 text-muted-foreground" />}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        {!notification.read && <div className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(notification.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
