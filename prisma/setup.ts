import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    // Vérifier si les rôles existent déjà
    const adminRoleExists = await prisma.role.findUnique({
      where: { id: "admin" },
    });

    const userRoleExists = await prisma.role.findUnique({
      where: { id: "user" },
    });

    // Créer les rôles s'ils n'existent pas
    if (!adminRoleExists) {
      await prisma.role.create({
        data: {
          id: "admin",
          name: "Administrateur",
          description: "Accès complet à toutes les fonctionnalités",
        },
      });
      console.log("Rôle admin créé");
    }

    if (!userRoleExists) {
      await prisma.role.create({
        data: {
          id: "user",
          name: "Utilisateur",
          description: "Accès en lecture seule",
        },
      });
      console.log("Rôle user créé");
    }

    // Vérifier si l'utilisateur admin existe déjà
    const adminExists = await prisma.user.findUnique({
      where: { email: "admin@tastenantes.fr" },
    });

    // Créer l'utilisateur admin s'il n'existe pas
    if (!adminExists) {
      const hashedPassword = await hash("Admin123!", 10);
      await prisma.user.create({
        data: {
          name: "Admin",
          email: "admin@tastenantes.fr",
          password: hashedPassword,
          roleId: "admin",
        },
      });
      console.log("Utilisateur admin créé");
    }

    console.log("Configuration terminée avec succès");
  } catch (error) {
    console.error("Erreur lors de la configuration :", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
