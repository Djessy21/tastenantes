import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Récupérer toutes les images
    const { rows: images } = await sql`
      SELECT * FROM restaurant_images
    `;

    // Récupérer tous les plats avec leurs images
    const { rows: dishes } = await sql`
      SELECT d.*, ri.image_url 
      FROM dishes d 
      LEFT JOIN restaurant_images ri ON ri.id = d.image_id
    `;

    return NextResponse.json({
      images,
      dishes,
      message: "Debug data retrieved successfully",
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve debug data" },
      { status: 500 }
    );
  }
}
