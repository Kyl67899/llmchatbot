import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { clerkId, email, username } = await req.json();
    if (!clerkId && !email) {
      return NextResponse.json({ error: "Missing identifiers" }, { status: 400 });
    }

    // 1) Try to find existing by clerkId (best) or by email
    let user = clerkId ? await prisma.user.findUnique({ where: { clerkId } }) : null;
    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    // 2) If not found, try create
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            clerkId,
            email,
            username,
          },
        });
      } catch (e: any) {
        // Handle unique constraint race (P2002)
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          // Someone else created the user concurrently — fetch existing user
          user = clerkId
            ? await prisma.user.findUnique({ where: { clerkId } })
            : await prisma.user.findUnique({ where: { email } });

          if (!user) {
            // unexpected: rethrow so higher-level handler sees it
            throw e;
          }
        } else {
          throw e;
        }
      }
    }

    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    console.error("user route error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
