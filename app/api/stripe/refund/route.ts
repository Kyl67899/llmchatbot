// app/api/refund/route.ts
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { paymentId, reason } = body;
  // TODO: authenticate and authorize caller
  if (!paymentId) return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  if (!payment.stripePaymentId) return NextResponse.json({ error: "No stripe payment attached" }, { status: 400 });

  // Create refund
  const refund = await stripe.refunds.create({ payment_intent: payment.stripePaymentId, reason: reason ?? undefined });

  // Persist refund
  await prisma.refund.create({
    data: {
      paymentId: payment.id,
      stripeRefundId: refund.id,
      amount: refund.amount ?? 0,
      reason: refund.reason ?? reason ?? "manual",
      status: refund.status,
    },
  });

  // Optionally update payment/org credits synchronously or rely on webhook
  // Here, we update payment status immediately if refund succeeded
  if (refund.status === "succeeded") {
    await prisma.$transaction([
      prisma.payment.update({ where: { id: payment.id }, data: { status: "refunded" } }),
      prisma.organization.update({ where: { id: payment.organizationId }, data: { credits: { decrement: payment.credits } } }),
    ]);
  }

  return NextResponse.json({ ok: true, refundId: refund.id });
}
