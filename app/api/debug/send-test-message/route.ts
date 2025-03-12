import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Créer un message de test avec un horodatage pour le rendre unique
    const timestamp = new Date().toISOString();
    const testMessage = {
      name: "Utilisateur Test",
      email: "test@example.com",
      subject: `Message de test - ${timestamp}`,
      message: `Ceci est un message de test créé automatiquement pour vérifier le fonctionnement du système de messages. Timestamp: ${timestamp}`,
    };

    try {
      // Insérer le message de test dans la base de données
      const result = await prisma.$executeRaw`
        INSERT INTO contact_messages (name, email, subject, message)
        VALUES (${testMessage.name}, ${testMessage.email}, ${testMessage.subject}, ${testMessage.message})
        RETURNING id
      `;

      return NextResponse.json({
        success: true,
        message: "Message de test créé avec succès",
        testMessage,
        result,
      });
    } catch (dbError) {
      console.error("Erreur lors de l'insertion en base de données:", dbError);
      return NextResponse.json(
        {
          error: "Erreur lors de l'insertion en base de données",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la création du message de test:", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la création du message de test",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
