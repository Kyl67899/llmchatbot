// app/api/payments/list/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, limit = 50 } = await req.json();
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: Number(limit),
    });

    const normalized = payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency ?? "usd",
      status: p.status,
      packageId: p.packageId,
      credits: p.credits,
      createdAt: p.createdAt,
      stripePaymentId: p.stripePaymentId ?? null,
    }));

    return NextResponse.json({ payments: normalized });
  } catch (err: any) {
    console.error("payments list error:", err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
