import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de message invalide" },
        { status: 400 }
      );
    }

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

    // Marquer le message comme lu
    try {
      console.log(`Marquage du message ${id} comme lu`);
      await prisma.$executeRaw`
        UPDATE contact_messages
        SET is_read = true, read_at = NOW()
        WHERE id = ${id}
      `;

      return NextResponse.json({
        success: true,
        message: "Message marqué comme lu avec succès",
      });
    } catch (dbError) {
      console.error("Erreur lors du marquage du message comme lu:", dbError);
      return NextResponse.json(
        {
          error: "Erreur lors du marquage du message comme lu",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors du marquage du message comme lu:", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors du marquage du message comme lu",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
