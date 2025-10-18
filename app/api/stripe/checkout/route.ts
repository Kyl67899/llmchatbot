// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("DEBUG /api/stripe/checkout body:", body);

    const { packageId, userId, organizationId, returnUrl } = body ?? {};
    if (!packageId || !userId || !organizationId) {
      console.error("Missing fields:", { packageId, userId, organizationId });
      return NextResponse.json({ error: "Missing fields", details: { packageId, userId, organizationId } }, { status: 400 });
    }

    const pkg = await prisma.creditPackage.findUnique({ where: { id: packageId } });
    if (!pkg) {
      console.error("Package not found for id:", packageId);
      return NextResponse.json({ error: "Invalid package id" }, { status: 400 });
    }
    if (!pkg.stripePriceId) {
      console.error("Package missing stripePriceId:", pkg);
      return NextResponse.json({ error: "Package missing stripePriceId" }, { status: 400 });
    }

    // Ensure stripe client and env are present
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Missing STRIPE_SECRET_KEY env");
      return NextResponse.json({ error: "Server misconfiguration: missing STRIPE_SECRET_KEY" }, { status: 500 });
    }

    console.log("Creating pending payment for pkg:", pkg.id, "priceId:", pkg.stripePriceId);
    const payment = await prisma.payment.create({
      data: { userId, organizationId, packageId: pkg.id, amount: pkg.price, credits: pkg.credits, status: "pending" },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const customerEmail = user?.email ?? undefined;

    let stripeCustomerId = user?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email: customerEmail, metadata: { appUserId: userId, organizationId } });
      stripeCustomerId = customer.id;
      await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId } });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer: stripeCustomerId,
      line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
      metadata: { paymentId: payment.id, userId, organizationId, type: "purchase" },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/purchase/cancel`,
    });

    console.log("Created stripe session:", session.id);
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout route error:", err);
    return NextResponse.json({ error: err?.message ?? "unknown error", stack: err?.stack ?? null }, { status: 500 });
  }
}
