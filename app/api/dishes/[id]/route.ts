import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const { rowCount } = await sql`
      DELETE FROM dishes 
      WHERE id = ${id} 
      RETURNING *
    `;

    if (rowCount === 0) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting dish:", error);
    return NextResponse.json(
      { error: "Failed to delete dish" },
      { status: 500 }
    );
  }
}
