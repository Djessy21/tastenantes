import { NextResponse } from "next/server";
import { addPhotoCreditsColumns } from "@/app/lib/db-migration";

export async function GET() {
  try {
    const result = await addPhotoCreditsColumns();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error running migration:", error);
    return NextResponse.json(
      { error: "Failed to run migration" },
      { status: 500 }
    );
  }
}
