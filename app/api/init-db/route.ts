import { NextResponse } from "next/server";
import { initDB } from "@/app/lib/db-edge";

export const runtime = "edge";

export async function GET() {
  try {
    console.log("API Init DB: Début de l'initialisation de la base de données");
    await initDB();
    console.log("API Init DB: Base de données initialisée avec succès");
    return NextResponse.json({ message: "Database initialized successfully" });
  } catch (error) {
    console.error(
      "API Init DB: Erreur lors de l'initialisation de la base de données:",
      error
    );
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}
