import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

// Créer une instance de PrismaClient
const prisma = new PrismaClient();

// Fonction pour créer un administrateur
async function createAdmin() {
  try {
    // Créer les rôles s'ils n'existent pas
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

    // Créer l'utilisateur admin
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

    return { success: true, message: "Utilisateur admin créé avec succès" };
  } catch (error) {
    console.error("Erreur lors de la création de l'admin:", error);
    return { success: false, error: "Erreur lors de la création de l'admin" };
  } finally {
    await prisma.$disconnect();
  }
}

// Route GET pour initialiser l'administrateur
export async function GET(request: Request) {
  // Vérifier si nous sommes en environnement de production
  if (process.env.NODE_ENV === "production") {
    // En production, utiliser un secret pour autoriser l'accès
    const secretKey = process.env.SETUP_SECRET_KEY || "default-secret-key";

    // Récupérer la clé de la requête
    const { searchParams } = new URL(request.url);
    const providedKey = searchParams.get("key");

    if (providedKey !== secretKey) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  const result = await createAdmin();

  if (result.success) {
    return NextResponse.json(
      {
        message: result.message,
        credentials: {
          email: "admin@tastenantes.fr",
          password: "Admin123!",
        },
      },
      { status: 200 }
    );
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
}
