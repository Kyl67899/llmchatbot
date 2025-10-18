import prisma from "@/lib/prisma";

// Subscription Plans Configuration
export const SUBSCRIPTION_PLANS = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for individuals getting started",
    monthlyCredits: 1000,
    price: 999, // $9.99
    features: ["1,000 credits per month", "Access to GPT-4o-mini", "Email support", "Basic analytics"],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Best for professionals and small teams",
    monthlyCredits: 5000,
    price: 2999, // $29.99
    features: [
      "5,000 credits per month",
      "Access to GPT-4o-mini & GPT-4",
      "Priority support",
      "Advanced analytics",
      "Team collaboration (Comming Soon)",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large teams and organizations",
    monthlyCredits: 20000,
    price: 9999, // $99.99
    features: [
      "20,000 credits per month",
      "Access to all models",
      "24/7 dedicated support",
      "Custom integrations",
      "Advanced security",
      "SLA guarantee",
    ],
    popular: false,
  },
]

// Get all subscription plans
export async function getSubscriptionPlans() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: "asc" },
    })

    // If no plans in database, return default plans
    if (plans.length === 0) {
      return SUBSCRIPTION_PLANS
    }

    return plans
  } catch (error) {
    console.error("Error fetching subscription plans:", error)
    return SUBSCRIPTION_PLANS
  }
}

// Create or update subscription plan
export async function upsertSubscriptionPlan(
  id: string,
  name: string,
  description: string,
  monthlyCredits: number,
  price: number,
  stripePriceId: string,
  stripeProductId: string,
  features: string[],
  popular = false,
) {
  try {
    return await prisma.subscriptionPlan.upsert({
      where: { id },
      update: {
        name,
        description,
        monthlyCredits,
        price,
        stripePriceId,
        stripeProductId,
        features,
        popular,
      },
      create: {
        id,
        name,
        description,
        monthlyCredits,
        price,
        stripePriceId,
        stripeProductId,
        features,
        popular,
      },
    })
  } catch (error) {
    console.error("Error upserting subscription plan:", error)
    return null
  }
}

// Get subscription by organization ID
export async function getSubscriptionByOrganizationId(organizationId: string) {
  try {
    return await prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return null
  }
}

// Create subscription
export async function createSubscription(
  organizationId: string,
  planId: string,
  stripeSubscriptionId: string,
  stripeCustomerId: string,
  status: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
) {
  try {
    return await prisma.subscription.create({
      data: {
        organizationId,
        planId,
        stripeSubscriptionId,
        stripeCustomerId,
        status,
        currentPeriodStart,
        currentPeriodEnd,
      },
    })
  } catch (error) {
    console.error("Error creating subscription:", error)
    return null
  }
}

// Update subscription
export async function updateSubscription(
  stripeSubscriptionId: string,
  data: {
    status?: string
    currentPeriodStart?: Date
    currentPeriodEnd?: Date
    cancelAtPeriodEnd?: boolean
  },
) {
  try {
    return await prisma.subscription.update({
      where: { stripeSubscriptionId },
      data,
    })
  } catch (error) {
    console.error("Error updating subscription:", error)
    return null
  }
}

// Cancel subscription
export async function cancelSubscription(stripeSubscriptionId: string) {
  try {
    return await prisma.subscription.update({
      where: { stripeSubscriptionId },
      data: {
        cancelAtPeriodEnd: true,
        status: "canceled",
      },
    })
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return null
  }
}

// Get subscription by Stripe subscription ID
export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  try {
    return await prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
      include: { plan: true, organization: true },
    })
  } catch (error) {
    console.error("Error fetching subscription by Stripe ID:", error)
    return null
  }
}
