// app/api/stripe/invoices/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { userId, limit = 20 } = await req.json();
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ invoices: [], error: "No Stripe customer linked" });
    }

    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit,
      expand: ["data.payment_intent"],
    });

    const normalized = invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amount_paid: inv.amount_paid,
      amount_due: inv.amount_due,
      currency: inv.currency,
      hosted_invoice_url: inv.hosted_invoice_url,
      invoice_pdf: inv.invoice_pdf,
      created: inv.created,
      period_start: inv.period_start,
      period_end: inv.period_end,
    }));

    return NextResponse.json({ invoices: normalized });
  } catch (err: any) {
    console.error("stripe invoices error:", err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
