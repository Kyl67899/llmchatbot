// app/api/stripe/portal/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ error: "No stripe customer linked" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: process.env.NEXT_PUBLIC_APP_URL || "/",
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("stripe portal error", err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
