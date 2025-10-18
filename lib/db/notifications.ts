import prisma from "@/lib/prisma";

export interface Notification {
  id: string;
  userId: string;
  senderId?: string | null;
  type: "credit_low" | "member_joined" | "member_left" | "system" | "welcome";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  senderId?: string | null;
}): Promise<Notification> {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      senderId: data.senderId ?? null,
      type: data.type,
      title: data.title,
      message: data.message,
      read: false,
    },
  });
}

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationRead(notificationId: string, userId?: string): Promise<void> {
  await prisma.notification.updateMany({
    where: userId ? { id: notificationId, userId } : { id: notificationId },
    data: { read: true },
  });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function deleteNotificationById(notificationId: string, userId?: string): Promise<void> {
  await prisma.notification.deleteMany({
    where: userId ? { id: notificationId, userId } : { id: notificationId },
  });
}

export async function countUnread(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}
