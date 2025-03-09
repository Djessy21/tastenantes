import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import * as dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log("Création des rôles...");

    // Créer le rôle admin s'il n'existe pas
    await prisma.role.upsert({
      where: { id: "admin" },
      update: {},
      create: {
        id: "admin",
        name: "Administrateur",
        description: "Accès complet à toutes les fonctionnalités",
      },
    });

    // Créer le rôle user s'il n'existe pas
    await prisma.role.upsert({
      where: { id: "user" },
      update: {},
      create: {
        id: "user",
        name: "Utilisateur",
        description: "Accès en lecture seule",
      },
    });

    console.log("Rôles créés avec succès");

    // Créer l'utilisateur admin
    const email = "admin@tastenantes.fr";
    const password = "Admin123!";

    console.log(`Création de l'utilisateur admin (${email})...`);

    const hashedPassword = await hash(password, 10);

    await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        roleId: "admin",
      },
      create: {
        name: "Admin",
        email,
        password: hashedPassword,
        roleId: "admin",
      },
    });

    console.log("Utilisateur admin créé avec succès");
    console.log("Email: admin@tastenantes.fr");
    console.log("Mot de passe: Admin123!");
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
