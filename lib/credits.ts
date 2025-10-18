import prisma from "@/lib/prisma";

export const CREDIT_COSTS = {
  MESSAGE: 1,
  IMAGE_GENERATION: 10,
  PREMIUM_MODEL: 5,
}

// Deduct credits from an organization
export async function deductCredits(organizationId: string, amount: number): Promise<boolean> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  })

  if (!org || org.credits < amount) {
    return false
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      credits: { decrement: amount },
    },
  })

  return true
}

// Add credits to an organization
export async function addCredits(organizationId: string, amount: number): Promise<number> {
  const updated = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      credits: { increment: amount },
    },
  })

  return updated.credits
}
