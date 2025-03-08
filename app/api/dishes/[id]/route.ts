import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export const runtime = "edge";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`API Dishes: Suppression du plat ${params.id}`);
    const dishId = parseInt(params.id);
    if (isNaN(dishId)) {
      return NextResponse.json({ error: "Invalid dish ID" }, { status: 400 });
    }

    // Supprimer le plat
    await sql`
      DELETE FROM dishes 
      WHERE id = ${dishId}
    `;

    console.log(`Plat ${dishId} supprimé avec succès`);
    return NextResponse.json({ message: "Dish deleted successfully" });
  } catch (error) {
    console.error("Error deleting dish:", error);
    return NextResponse.json(
      { error: "Failed to delete dish" },
      { status: 500 }
    );
  }
}
