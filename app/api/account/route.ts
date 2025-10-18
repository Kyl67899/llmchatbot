// app/api/account/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

type Action =
    | "getInfo"
    | "update"
    | "delete"
    | "subscriptions"
    | "invoices"
    | "payments"
    | "portal";

import { auth } from "@clerk/nextjs/server";

/** Throws an error-like object { status, message } on unauthorized */
async function ensureAuthorized(request: Request, targetUserId?: string) {
    const session = auth();
    const authUserId = session.userId ?? null;

    if (!authUserId) {
        throw { status: 401, message: "Unauthenticated" };
    }
    if (targetUserId && authUserId !== targetUserId) {
        throw { status: 403, message: "Forbidden: cannot act on another user" };
    }

    return authUserId;
}


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const action = body?.action as Action | undefined;
        const userId = body?.userId as string | undefined;
        const payload = body?.payload;

        if (!action) return NextResponse.json({ ok: false, error: "Missing action" }, { status: 400 });
        if (!userId) return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });

        await ensureAuthorized(req, userId);

        switch (action) {
            case "getInfo": {
                const clerkUser = await clerkClient.users.getUser(userId).catch(() => null);
                const dbUser = await prisma.user.findUnique({ where: { id: userId } });
                return NextResponse.json({ ok: true, data: { clerk: clerkUser, db: dbUser } });
            }

            case "update": {
                const updates = payload?.updates ?? {};
                if (Object.keys(updates).length === 0) {
                    return NextResponse.json({ ok: false, error: "No updates provided" }, { status: 400 });
                }
                const updated = await clerkClient.users.updateUser(userId, {
                    username: updates.username,
                    publicMetadata: updates.publicMetadata,
                });
                return NextResponse.json({ ok: true, data: { user: updated } });
            }

            case "delete": {
                // Soft-delete example: set deletedAt in DB, then optionally delete Clerk user
                await prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });
                await clerkClient.users.deleteUser(userId).catch(() => null);
                return NextResponse.json({ ok: true });
            }

            case "subscriptions": {
                const dbUser = await prisma.user.findUnique({ where: { id: userId } });
                if (!dbUser?.stripeCustomerId) return NextResponse.json({ ok: true, data: { subscriptions: [] } });
                const subs = await stripe.subscriptions.list({
                    customer: dbUser.stripeCustomerId,
                    expand: ["data.default_payment_method", "data.items.data.price.product"],
                    limit: payload?.limit ?? 100,
                });
                const normalized = subs.data.map((s) => ({
                    id: s.id,
                    status: s.status,
                    product: typeof s.items.data[0]?.price?.product === "object" ? (s.items.data[0].price.product as any).name : null,
                    priceId: s.items.data[0]?.price?.id ?? null,
                    current_period_start: s.current_period_start,
                    current_period_end: s.current_period_end,
                    cancel_at: s.cancel_at,
                    created: s.created,
                    quantity: s.items.data[0]?.quantity ?? 1,
                    metadata: s.metadata ?? {},
                }));
                return NextResponse.json({ ok: true, data: { subscriptions: normalized } });
            }

            case "invoices": {
                const limit = Number(payload?.limit ?? 20);
                const dbUser = await prisma.user.findUnique({ where: { id: userId } });
                if (!dbUser?.stripeCustomerId) return NextResponse.json({ ok: true, data: { invoices: [] } });
                const invoices = await stripe.invoices.list({
                    customer: dbUser.stripeCustomerId,
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
                return NextResponse.json({ ok: true, data: { invoices: normalized } });
            }

            case "payments": {
                const limit = Number(payload?.limit ?? 50);
                const payments = await prisma.payment.findMany({
                    where: { userId },
                    orderBy: { createdAt: "desc" },
                    take: limit,
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
                return NextResponse.json({ ok: true, data: { payments: normalized } });
            }

            case "portal": {
                const dbUser = await prisma.user.findUnique({ where: { id: userId } });
                if (!dbUser?.stripeCustomerId) return NextResponse.json({ ok: false, error: "No stripe customer linked" }, { status: 400 });
                const session = await stripe.billingPortal.sessions.create({
                    customer: dbUser.stripeCustomerId,
                    return_url: process.env.NEXT_PUBLIC_APP_URL ?? "/",
                });
                return NextResponse.json({ ok: true, data: { url: session.url } });
            }

            default:
                return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
        }
    } catch (err: any) {
        const status = err?.status ?? 500;
        const message = err?.message ?? "Server error";
        return NextResponse.json({ ok: false, error: message }, { status });
    }
}
