export type NotificationType = "credit_low" | "member_joined" | "member_left" | "message" | "system" | "welcome";

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
};

const API = {
  fetchNotifications: "/api/notifications",
  markRead: "/api/notifications/mark-read",
  markAllRead: "/api/notifications/mark-all-read",
  del: "/api/notifications/delete",
  unreadCount: "/api/notifications/unread-count",
};

function emitNotificationUpdate() {
  try { window.dispatchEvent(new Event("notification")); } catch {}
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const res = await fetch(API.fetchNotifications, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.notifications ?? [];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const res = await fetch(API.unreadCount, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) return 0;
  const json = await res.json();
  return Number(json.count || 0);
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  const res = await fetch(API.markRead, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, notificationId }),
  });
  if (res.ok) emitNotificationUpdate();
  return res.ok;
}

export async function markAllNotificationsAsRead(userId: string) {
  const res = await fetch(API.markAllRead, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (res.ok) emitNotificationUpdate();
  return res.ok;
}

export async function deleteNotification(userId: string, notificationId: string) {
  const res = await fetch(API.del, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, notificationId }),
  });
  if (res.ok) emitNotificationUpdate();
  return res.ok;
}
