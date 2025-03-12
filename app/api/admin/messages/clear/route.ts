import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {
    // Vérifier si on est en mode développement
    const isDevelopment = process.env.NODE_ENV === "development";

    // En mode développement, on ignore les vérifications d'authentification
    if (!isDevelopment) {
      // Vérifier l'authentification
      const session = await getServerSession(authOptions);

      if (!session) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
      }

      // Vérifier si l'utilisateur est admin
      const user = await prisma.user.findUnique({
        where: { email: session.user?.email as string },
        include: { role: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }

      if (user.role.id !== "admin") {
        return NextResponse.json(
          { error: "Accès refusé - Rôle requis: admin" },
          { status: 403 }
        );
      }
    }

    // Vérifier si la requête contient le header de confirmation
    const headers = request.headers;
    const confirmHeader = headers.get("X-Confirm-Clear");

    if (!confirmHeader || confirmHeader !== "true") {
      return NextResponse.json(
        { error: "Confirmation requise pour supprimer tous les messages" },
        { status: 400 }
      );
    }

    // Supprimer tous les messages
    try {
      const result = await prisma.$executeRaw`
        DELETE FROM contact_messages
      `;

      return NextResponse.json({
        success: true,
        message: "Tous les messages ont été supprimés avec succès",
      });
    } catch (dbError) {
      console.error("Erreur lors de la suppression des messages:", dbError);
      return NextResponse.json(
        {
          error: "Erreur lors de la suppression des messages",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la suppression des messages:", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la suppression des messages",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
