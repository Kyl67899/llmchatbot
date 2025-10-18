import prisma from "@/lib/prisma";

export interface Organization {
  id: string
  name: string
  credits: number
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationMember {
  id: string
  userId: string
  organizationId: string
  role: "admin" | "member"
  joinedAt: Date
}

export async function createOrganization(name: string, credits = 500): Promise<Organization> {
  try {
    return await prisma.organization.create({
      data: { name, credits },
    })
  } catch (error) {
    console.error("Failed to create organization:", error)
    throw error
  }
}

export async function addOrganizationMember(
  organizationId: string,
  userId: string,
  role: "admin" | "member",
): Promise<OrganizationMember> {
  return await prisma.organizationMember.create({
    data: {
      organizationId,
      userId,
      role,
    },
  })
}

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
  })
  return memberships.map((m) => m.organization)
}

export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  return await prisma.organizationMember.findMany({
    where: { organizationId },
  })
}

export async function updateOrganizationCredits(organizationId: string, credits: number): Promise<Organization> {
  return await prisma.organization.update({
    where: { id: organizationId },
    data: { credits },
  })
}

export async function addOrganizationCredits(organizationId: string, creditsToAdd: number): Promise<Organization> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  })
  if (!org) throw new Error("Organization not found")

  return await prisma.organization.update({
    where: { id: organizationId },
    data: { credits: org.credits + creditsToAdd },
  })
}

export async function removeOrganizationMember(organizationId: string, userId: string): Promise<void> {
  await prisma.organizationMember.deleteMany({
    where: {
      organizationId,
      userId,
    },
  })
}
