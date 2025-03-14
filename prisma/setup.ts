import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Configuration des rôles...");

    // Utiliser upsert pour créer les rôles s'ils n'existent pas
    await prisma.role.upsert({
      where: { id: "admin" },
      update: {},
      create: {
        id: "admin",
        name: "Administrateur",
        description: "Accès complet à toutes les fonctionnalités",
      },
    });

    await prisma.role.upsert({
      where: { id: "user" },
      update: {},
      create: {
        id: "user",
        name: "Utilisateur",
        description: "Accès en lecture seule",
      },
    });

    console.log("Rôles configurés avec succès");

    // Créer l'utilisateur admin s'il n'existe pas
    const hashedPassword = await hash("Admin123!", 10);

    await prisma.user.upsert({
      where: { email: "admin@tastenantes.fr" },
      update: {
        password: hashedPassword,
        roleId: "admin",
      },
      create: {
        name: "Admin",
        email: "admin@tastenantes.fr",
        password: hashedPassword,
        roleId: "admin",
      },
    });

    console.log("Utilisateur admin configuré avec succès");
  } catch (error) {
    console.error("Erreur lors de la configuration :", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
