import { NextResponse } from "next/server";
import { addWebsiteInstagramColumns } from "@/app/lib/db-migration";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    // Exécuter la migration
    const result = await addWebsiteInstagramColumns();

    if (result.success) {
      return NextResponse.json({ message: result.message });
    } else {
      return NextResponse.json(
        { error: "Migration failed", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error during migration:", error);
    return NextResponse.json(
      { error: "Migration failed", details: error },
      { status: 500 }
    );
  }
}
