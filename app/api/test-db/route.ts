import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test simple de connexion
    const { rows } = await sql`SELECT NOW()`;

    return NextResponse.json({
      success: true,
      timestamp: rows[0].now,
      database_url: process.env.POSTGRES_URL ? "Configuré" : "Non configuré",
      node_env: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Test DB Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        database_url: process.env.POSTGRES_URL ? "Configuré" : "Non configuré",
        node_env: process.env.NODE_ENV,
      },
      { status: 500 }
    );
  }
}
