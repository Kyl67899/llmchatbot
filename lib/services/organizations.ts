import prisma from "@/lib/prisma";

// Define the get Organization
export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  try {
    return await prisma.organization.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
    })
  } catch (error) {
    console.error("Error getting user organizations:", error)
    return []
  }
}

// Define get OrganizationMember type
export async function getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
  try {
    const members = await prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: { user: true },
    })

    return members.map((m) => ({
      userId: m.userId,
      username: m.user.username,
      email: m.user.email,
      role: m.role as "admin" | "member",
      joinedAt: m.createdAt.getTime(),
    }))
  } catch (error) {
    console.error("Error getting organization members:", error)
    return []
  }
}

// add members
export async function addOrganizationMember(
  orgId: string,
  userId: string,
  role: "admin" | "member" = "member",
): Promise<boolean> {
  try {
    await prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        userId,
        role,
      },
    })

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: orgId },
    })

    for (const member of members) {
      if (member.userId !== userId) {
        await prisma.notification.create({
          data: {
            userId: member.userId,
            type: "member_joined",
            title: "New Member Joined",
            message: "A new member has joined the organization",
            senderId: userId,
          },
        })
      }
    }

    return true
  } catch (error) {
    console.error("Error adding organization member:", error)
    return false
  }
}

// remove org member
export async function removeOrganizationMember(orgId: string, userId: string): Promise<void> {
  try {
    const members = await prisma.organizationMember.findMany({
      where: { organizationId: orgId },
    })

    await prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    })

    for (const member of members) {
      if (member.userId !== userId) {
        await prisma.notification.create({
          data: {
            userId: member.userId,
            type: "member_left",
            title: "Member Left",
            message: "A member has left the organization",
          },
        })
      }
    }
  } catch (error) {
    console.error("Error removing organization member:", error)
  }
}

// update members role
export async function updateMemberRole(orgId: string, userId: string, role: "admin" | "member") {
  try {
    await prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
      data: { role },
    })
  } catch (error) {
    console.error("Error updating member role:", error)
  }
}

// create organization
export async function createOrganization(name: string, creatorUserId: string): Promise<Organization> {
  const org = await prisma.organization.create({
    data: {
      name,
      credits: 100,
      members: {
        create: {
          userId: creatorUserId,
          role: "admin",
        },
      },
    },
  })

  return org
}

// update organization credits
export async function updateOrganizationCredits(orgId: string, credits: number): Promise<void> {
  try {
    await prisma.organization.update({
      where: { id: orgId },
      data: { credits },
    })
  } catch (error) {
    console.error("Error updating organization credits:", error)
  }
}

// invite member by email
export async function inviteMemberByEmail(orgId: string, email: string, inviterId: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { success: false, error: "User not found" }

  const existing = await prisma.organizationMember.findFirst({
    where: { userId: user.id, organizationId: orgId },
  })
  if (existing) return { success: false, error: "User is already a member" }

  await prisma.organizationMember.create({
    data: {
      userId: user.id,
      organizationId: orgId,
      role: "member",
      joinedAt: new Date(),
    },
  })

  return { success: true }
}
