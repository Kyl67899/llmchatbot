// app/api/webhook/route.ts
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";

export const config = { api: { bodyParser: false } };

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const buf = Buffer.from(await req.arrayBuffer());
  const sig = req.headers.get("stripe-signature") ?? "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err?.message ?? err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId as string | undefined;
      const metaType = session.metadata?.type as string | undefined;

      if (!paymentId) {
        console.warn("checkout.session.completed missing paymentId metadata");
      } else {
        const existing = await prisma.payment.findUnique({ where: { id: paymentId } });
        if (!existing) {
          console.warn("Payment record not found for id:", paymentId);
        } else if (existing.status === "completed") {
          // already processed
        } else {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: paymentId },
              data: {
                status: "completed",
                stripeSessionId: session.id,
                stripePaymentId: session.payment_intent ?? undefined,
              },
            });

            if (metaType === "purchase") {
              const org = await tx.organization.update({
                where: { id: existing.organizationId },
                data: { credits: { increment: existing.credits } },
              });

              await tx.creditTransaction.create({
                data: {
                  organizationId: existing.organizationId,
                  userId: existing.userId,
                  amount: existing.credits,
                  type: "purchase",
                },
              });

              await tx.notification.create({
                data: {
                  userId: existing.userId,
                  senderId: null,
                  type: "purchase",
                  title: "Purchase completed",
                  message: `Your organization ${org.name} received ${existing.credits} credits.`,
                },
              });
            } else if (metaType === "subscription") {
              const stripeSubscriptionId = (session.subscription as string) ?? null;
              if (stripeSubscriptionId) {
                await tx.subscription.upsert({
                  where: { organizationId: existing.organizationId },
                  update: {
                    planId: existing.packageId,
                    stripeSubscriptionId,
                    status: "active",
                    updatedAt: new Date(),
                  },
                  create: {
                    organizationId: existing.organizationId,
                    planId: existing.packageId,
                    stripeSubscriptionId,
                    stripeCustomerId: session.customer as string ?? "",
                    status: "active",
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  },
                });

                await tx.notification.create({
                  data: {
                    userId: existing.userId,
                    senderId: null,
                    type: "subscription",
                    title: "Subscription started",
                    message: `Subscription activated for your organization.`,
                  },
                });
              }
            }
          });
        }
      }
    }

    // Handle charge.refunded events to keep DB in sync
    if (event.type === "charge.refunded" || event.type === "charge.refund.updated") {
      const charge = event.data.object as Stripe.Charge;
      const stripePaymentIntent = charge.payment_intent as string | undefined;
      // Try to find payment by stripePaymentId or fallback to matching metadata
      const payment =
        (stripePaymentIntent && (await prisma.payment.findFirst({ where: { stripePaymentId: stripePaymentIntent } }))) ||
        (charge.metadata?.paymentId && (await prisma.payment.findUnique({ where: { id: charge.metadata.paymentId } })));

      if (payment) {
        const refundedAmount = charge.amount_refunded ?? 0;

        // Avoid duplicate work if already refunded fully
        if (payment.status === "refunded") {
          // already handled
        } else {
          await prisma.$transaction(async (tx) => {
            await tx.refund.create({
              data: {
                paymentId: payment.id,
                stripeRefundId: charge.refunds?.data?.[0]?.id ?? null,
                amount: refundedAmount,
                reason: "stripe_refund_event",
                status: "completed",
              },
            });

            if (refundedAmount >= payment.amount) {
              await tx.payment.update({ where: { id: payment.id }, data: { status: "refunded" } });
              await tx.organization.update({
                where: { id: payment.organizationId },
                data: { credits: { decrement: payment.credits } },
              });
              await tx.creditTransaction.create({
                data: {
                  organizationId: payment.organizationId,
                  userId: payment.userId,
                  amount: -payment.credits,
                  type: "refund",
                },
              });
            } else {
              await tx.payment.update({ where: { id: payment.id }, data: { status: "partially_refunded" } });
            }
          });
        }
      } else {
        console.warn("Refund event received but payment not found for charge:", charge.id);
      }
    }

    // Handle invoice.payment_succeeded for recurring billing credit grants
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeSubscriptionId = invoice.subscription as string | undefined;
      if (stripeSubscriptionId) {
        const sub = await prisma.subscription.findUnique({ where: { stripeSubscriptionId } });
        if (sub) {
          const plan = await prisma.subscriptionPlan.findUnique({ where: { id: sub.planId } });
          if (plan?.monthlyCredits) {
            await prisma.$transaction(async (tx) => {
              await tx.organization.update({
                where: { id: sub.organizationId },
                data: { credits: { increment: plan.monthlyCredits } },
              });
              await tx.creditTransaction.create({
                data: {
                  organizationId: sub.organizationId,
                  userId: sub.organizationId,
                  amount: plan.monthlyCredits,
                  type: "purchase",
                },
              });
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
