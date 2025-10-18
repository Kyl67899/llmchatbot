// // app/api/subscribe/route.ts
// import { NextResponse } from "next/server";
// import stripe from "@/lib/stripe";
// import prisma from "@/lib/prisma";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { userId, organizationId, planId, successUrl, cancelUrl } = body;
//     if (!userId || !organizationId || !planId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

//     const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
//     if (!plan || !plan.stripePriceId) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

//     // Create a pending payment record for audit
//     const payment = await prisma.payment.create({
//       data: {
//         userId,
//         packageId: planId,
//         amount: plan.price,
//         credits: plan.monthlyCredits,
//         status: "pending",
//       },
//     });

//     const session = await stripe.checkout.sessions.create({
//       mode: "subscription",
//       payment_method_types: ["card"],
//       line_items: [{ price: plan.stripePriceId, quantity: 1 }],
//       metadata: { paymentId: payment.id, planId },
//       success_url: successUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: cancelUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
//     });

//     return NextResponse.json({ url: session.url });
//   } catch (err) {
//     console.error("subscribe error", err);
//     return NextResponse.json({ error: "Internal" }, { status: 500 });
//   }
// }


// app/api/stripe/subscriptions/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ subscriptions: [], error: "No Stripe customer linked" });
    }

    const subs = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      expand: ["data.default_payment_method", "data.items.data.price.product"],
      limit: 100,
    });

    // Normalize to lightweight shape for client
    const subscriptions = subs.data.map((s) => ({
      id: s.id,
      status: s.status,
      priceId: s.items.data[0]?.price?.id ?? null,
      product: typeof s.items.data[0]?.price?.product === "object" ? (s.items.data[0].price.product as any).name : null,
      current_period_start: s.current_period_start,
      current_period_end: s.current_period_end,
      cancel_at: s.cancel_at,
      created: s.created,
      quantity: s.items.data[0]?.quantity ?? 1,
      metadata: s.metadata ?? {},
    }));

    return NextResponse.json({ subscriptions });
  } catch (err: any) {
    console.error("stripe subscriptions error:", err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
