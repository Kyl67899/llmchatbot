import prisma from "@/lib/prisma";

export async function createSession(userId: string, organizationId: string) {
  return await prisma.session.create({
    data: {
      userId,
      organizationId,
      token: crypto.randomUUID(),
    },
  })
}

export async function getSessionByToken(token: string) {
  return await prisma.session.findUnique({
    where: { token },
  })
}

export async function updateSessionOrganization(token: string, organizationId: string) {
  return await prisma.session.update({
    where: { token },
    data: { organizationId },
  })
}

export async function deleteSession(token: string) {
  return await prisma.session.delete({
    where: { token },
  })
}
