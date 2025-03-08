import { NextResponse } from "next/server";
import { initDB } from "@/app/lib/db-edge";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    // Vérifier si une clé d'API est fournie pour la sécurité
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get("key");

    // Vérifier si la clé d'API est valide (à remplacer par votre propre clé)
    if (apiKey !== "reset-tastenantes-db") {
      return NextResponse.json(
        { error: "Clé d'API invalide" },
        { status: 401 }
      );
    }

    // Réinitialiser la base de données
    await initDB();

    return NextResponse.json({
      message: "Base de données réinitialisée avec succès",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "Erreur lors de la réinitialisation de la base de données:",
      error
    );
    return NextResponse.json(
      { error: "Échec de la réinitialisation de la base de données" },
      { status: 500 }
    );
  }
}
