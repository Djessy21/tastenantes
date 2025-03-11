import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { isProduction } from "@/app/lib/env";

/**
 * Endpoint API pour supprimer tous les restaurants
 *
 * Méthode: DELETE
 * URL: /api/restaurants/clear
 *
 * Sécurité:
 * - Accessible uniquement par les administrateurs
 * - Désactivé en environnement de production (sauf avec l'en-tête X-Force-Delete)
 */
export async function DELETE(request: Request) {
  // Vérifier l'authentification et les droits d'admin
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Vérifier l'environnement pour éviter de supprimer accidentellement les données de production
  if (isProduction()) {
    // Vérifier si l'en-tête X-Force-Delete est présent
    const forceDelete = request.headers.get("X-Force-Delete") === "true";

    if (!forceDelete) {
      return NextResponse.json(
        {
          error:
            "Cette action n'est pas autorisée en environnement de production",
          message:
            "Utilisez l'en-tête X-Force-Delete: true si vous êtes absolument sûr de vouloir supprimer toutes les données de production.",
        },
        { status: 403 }
      );
    }
  }

  try {
    // Supprimer tous les restaurants (cela supprimera également les plats associés grâce aux relations)
    const deletedCount = await prisma.restaurant.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `${deletedCount.count} restaurants ont été supprimés avec succès`,
      count: deletedCount.count,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression des restaurants:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression des restaurants" },
      { status: 500 }
    );
  }
}
