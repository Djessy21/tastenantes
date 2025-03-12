import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ⚠️ ATTENTION: Cette API est uniquement destinée au débogage et ne doit pas être utilisée en production
// Elle ignore toutes les vérifications d'authentification et d'autorisation

export async function GET(request: Request) {
  try {
    console.log(
      "API de contournement appelée - Récupération des messages sans vérification d'authentification"
    );

    // Récupérer tous les messages de contact, triés par date de création (les plus récents d'abord)
    try {
      const messages = await prisma.$queryRaw`
        SELECT * FROM contact_messages
        ORDER BY created_at DESC
      `;

      const count = Array.isArray(messages) ? messages.length : 0;
      console.log(`${count} messages récupérés`);

      return NextResponse.json({
        messages,
        count,
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
