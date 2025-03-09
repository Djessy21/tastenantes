import { PrismaClient } from "@prisma/client";

// Déclaration pour le contexte global
declare global {
  var prisma: PrismaClient | undefined;
}

// Création d'un singleton pour éviter les connexions multiples en développement
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
