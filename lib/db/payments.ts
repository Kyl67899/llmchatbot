import prisma from "@/lib/prisma";

export interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  stripePriceId?: string
  popular: boolean
}

export interface Payment {
  id: string
  userId: string
  organizationId: string
  packageId: string
  stripeSessionId?: string
  stripePaymentId?: string
  amount: number
  credits: number
  status: "pending" | "completed" | "failed" | "refunded"
  createdAt: Date
}

// export type CreditPackage = Prisma.CreditPackageGetPayload<{}>
// export type Payment = Prisma.PaymentGetPayload<{}>

// Get all credit packages
export async function getCreditPackages(): Promise<CreditPackage[]> {
  try {
    const packages = await prisma.creditPackage.findMany({
      orderBy: { credits: "asc" },
    })
    return packages
  } catch (error) {
    console.error("Error fetching credit packages:", error)
    // Return default packages if database is not connected
    return getDefaultPackages()
  }
}

// Get default packages (fallback when DB is not connected)
export function getDefaultPackages(): CreditPackage[] {
  return [
    {
      id: "starter",
      name: "Starter",
      credits: 250,
      price: 999, // $9.99
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      credits: 800,
      price: 3999, // $39.99
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      credits: 5000,
      price: 9999, // $99.99
      popular: false,
    },
  ]
}

// Create a payment record
export async function createPayment(
  userId: string,
  organizationId: string,
  packageId: string,
  amount: number,
  credits: number,
  stripeSessionId?: string,
): Promise<Payment> {
  try {
    return await prisma.payment.create({
      data: {
        userId,
        organizationId,
        packageId,
        amount,
        credits,
        status: "pending",
        stripeSessionId,
      },
    })
  } catch (error) {
    console.error("Error creating payment:", error)
    throw error
  }
}

// Update payment status
export async function updatePaymentStatus(
  paymentId: string,
  status: "completed" | "failed" | "refunded",
  stripePaymentId?: string,
): Promise<void> {
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status,
      stripePaymentId,
      updatedAt: new Date(),
    },
  })
}

// Get payment by Stripe session ID
export async function getPaymentBySessionId(sessionId: string): Promise<Payment | null> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { stripeSessionId: sessionId },
    })
    return payment
  } catch (error) {
    console.error("Error fetching payment by session ID:", error)
    return null
  }
}

// Get user's payment history
export async function getUserPayments(userId: string): Promise<Payment[]> {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })
    return payments
  } catch (error) {
    console.error("Error fetching user payments:", error)
    return []
  }
}
