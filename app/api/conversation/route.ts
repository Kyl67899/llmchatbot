import prisma from "@/lib/prisma";
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { userId, orgId } = await req.json()
  const conversations = await prisma.conversation.findMany({
    where: { userId, organizationId: orgId },
    include: { messages: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(conversations)
}
