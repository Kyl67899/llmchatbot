import { NextResponse } from "next/server";
import * as db from "@/lib/db/notifications";

export async function POST(req: Request) {
  const { userId, notificationId } = await req.json();
  if (!userId || !notificationId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  await db.markNotificationRead(notificationId, userId);
  return NextResponse.json({ ok: true });
}
