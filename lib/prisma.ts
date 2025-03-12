import { PrismaClient } from "@prisma/client";

// Utiliser une instance singleton de Prisma pour éviter trop de connexions
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
