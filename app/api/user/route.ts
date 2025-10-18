import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { clerkId, username, email } = await req.json()

  if (!clerkId) {
    return NextResponse.json({ error: "Missing clerkId" }, { status: 400 })
  }

  let user = await prisma.user.findUnique({
    where: { clerkId },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId,
        username,
        email,
      },
    });
  }
  

  return NextResponse.json(user);
}