import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Récupérer tous les messages de contact
    const messages = await prisma.$queryRaw`
      SELECT * FROM contact_messages
      ORDER BY created_at DESC
    `;

    // Afficher également le nombre de messages
    const count = Array.isArray(messages) ? messages.length : 0;

    return NextResponse.json({
      count,
      messages,
    });
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
