import { NextResponse } from "next/server";
import { db } from "@/lib/db/notifications";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const notifications = await db.getUserNotifications(userId);
    return NextResponse.json({ notifications });
  } catch (err) {
    console.error("notifications route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
