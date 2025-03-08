import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Supprimer d'abord les plats associés
    await sql`DELETE FROM dishes WHERE restaurant_id = ${id}`;

    // Supprimer le restaurant
    const { rowCount } = await sql`
      DELETE FROM restaurants 
      WHERE id = ${id} 
      RETURNING *
    `;

    if (rowCount === 0) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return NextResponse.json(
      { error: "Failed to delete restaurant" },
      { status: 500 }
    );
  }
}
