import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// declare global {
//   // eslint-disable-next-line no-var
//   var __prisma?: PrismaClient;
// }

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma
}

export async function isDatabaseConnected(retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.warn(`DB connection attempt ${i + 1} failed`, error)
      await new Promise((res) => setTimeout(res, 500))
    }
  }

  console.error("Database connection failed after retries")
  return false
}

export async function disconnectPrisma() {
  await prisma.$disconnect()
}

// console.log("Using Prisma version:", PrismaClient.version?.client);

export default prisma;


