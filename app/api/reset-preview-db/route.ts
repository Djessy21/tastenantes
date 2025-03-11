import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { isPreview } from "@/app/lib/env";

export async function POST() {
  // Vérifier que nous sommes dans l'environnement de preview
  if (!isPreview()) {
    return NextResponse.json(
      {
        error:
          "Cette action n'est autorisée que dans l'environnement de preview",
      },
      { status: 403 }
    );
  }

  // Vérifier l'authentification et les droits d'admin
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    // Supprimer tous les restaurants (cela supprimera également les plats associés grâce aux relations)
    await prisma.restaurant.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "Base de données de preview réinitialisée avec succès",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la réinitialisation de la base de données:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la réinitialisation de la base de données" },
      { status: 500 }
    );
  }
}
