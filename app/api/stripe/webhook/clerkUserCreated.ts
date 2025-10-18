import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()
  const { id, email_addresses, username } = body

  await prisma.user.create({
    data: {
      // clerkId: id,
      email: email_addresses[0]?.email_address,
      // username,
    },
  })

  const user = await prisma.user.findUnique({ where: { email } })


  return NextResponse.json({ success: true })
}
