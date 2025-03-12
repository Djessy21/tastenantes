import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Vérifier si on est en mode développement
    const isDevelopment = process.env.NODE_ENV === "development";

    // Vérifier l'authentification
    const session = await getServerSession(authOptions);

    console.log("Session:", session);

    if (!session) {
      console.log("Pas de session, accès refusé");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // En mode développement, on permet l'accès sans vérification du rôle
    if (isDevelopment) {
      console.log(
        "Mode développement: accès autorisé sans vérification du rôle"
      );

      try {
        const messages = await prisma.$queryRaw`
          SELECT * FROM contact_messages
          ORDER BY created_at DESC
        `;

        console.log(
          "Nombre de messages récupérés:",
          Array.isArray(messages) ? messages.length : 0
        );

        return NextResponse.json({
          messages,
          count: Array.isArray(messages) ? messages.length : 0,
        });
      } catch (dbError) {
        console.error("Erreur lors de la requête SQL:", dbError);
        return NextResponse.json(
          {
            error: "Erreur lors de la requête SQL",
            details:
              dbError instanceof Error ? dbError.message : String(dbError),
          },
          { status: 500 }
        );
      }
    }

    // En production, on vérifie le rôle
    // Vérifier si l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
      include: { role: true },
    });

    console.log("Utilisateur:", user);

    if (!user) {
      console.log(
        "Utilisateur non trouvé, mais on continue en mode développement"
      );

      // En développement, on permet quand même l'accès
      if (isDevelopment) {
        try {
          const messages = await prisma.$queryRaw`
            SELECT * FROM contact_messages
            ORDER BY created_at DESC
          `;

          console.log(
            "Nombre de messages récupérés:",
            Array.isArray(messages) ? messages.length : 0
          );

          return NextResponse.json({
            messages,
            count: Array.isArray(messages) ? messages.length : 0,
          });
        } catch (dbError) {
          console.error("Erreur lors de la requête SQL:", dbError);
          return NextResponse.json(
            {
              error: "Erreur lors de la requête SQL",
              details:
                dbError instanceof Error ? dbError.message : String(dbError),
            },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }
    }

    if (user.role.id !== "admin" && !isDevelopment) {
      console.log("L'utilisateur n'est pas admin:", user.role);
      return NextResponse.json(
        {
          error:
            "Accès refusé - Rôle requis: admin, rôle actuel: " + user.role.id,
        },
        { status: 403 }
      );
    }

    // Récupérer tous les messages de contact, triés par date de création (les plus récents d'abord)
    try {
      const messages = await prisma.$queryRaw`
        SELECT * FROM contact_messages
        ORDER BY created_at DESC
      `;

      console.log(
        "Nombre de messages récupérés:",
        Array.isArray(messages) ? messages.length : 0
      );

      return NextResponse.json({
        messages,
        count: Array.isArray(messages) ? messages.length : 0,
      });
    } catch (dbError) {
      console.error("Erreur lors de la requête SQL:", dbError);
      return NextResponse.json(
        {
          error: "Erreur lors de la requête SQL",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la récupération des messages",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
