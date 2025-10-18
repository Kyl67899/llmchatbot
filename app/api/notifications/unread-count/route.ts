import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  try {
    const count = await prisma.notification.count({ where: { userId, read: false } });
    return NextResponse.json({ count });
  } catch (err) {
    console.error("unread-count error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
