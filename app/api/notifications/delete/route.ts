import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId, notificationId } = await req.json();
  if (!userId || !notificationId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    await prisma.notification.deleteMany({ where: { id: notificationId, userId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("delete notification error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
