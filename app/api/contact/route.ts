import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Extraire les données du corps de la requête
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validation des données
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'email est valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Adresse email invalide" },
        { status: 400 }
      );
    }

    try {
      // Enregistrer le message dans la base de données
      // Utiliser directement le nom de la table dans la base de données
      const result = await prisma.$executeRaw`
        INSERT INTO contact_messages (name, email, subject, message)
        VALUES (${name}, ${email}, ${subject}, ${message})
        RETURNING id
      `;

      // Répondre avec succès
      return NextResponse.json({
        success: true,
        message: "Votre message a été enregistré avec succès",
      });
    } catch (dbError) {
      console.error("Erreur lors de l'insertion en base de données:", dbError);
      throw dbError; // Relancer l'erreur pour être capturée par le bloc catch externe
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du message:", error);

    // Répondre avec une erreur
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'enregistrement du message" },
      { status: 500 }
    );
  }
}
