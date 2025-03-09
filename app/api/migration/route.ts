import { NextResponse } from "next/server";
import {
  addPhotoCreditsColumns,
  addWebsiteInstagramColumns,
} from "@/app/lib/db-migration";

export async function GET() {
  try {
    console.log(
      "Exécution de la migration des colonnes website et instagram..."
    );
    const websiteInstagramResult = await addWebsiteInstagramColumns();

    console.log("Exécution de la migration des colonnes photo_credit...");
    const photoCreditResult = await addPhotoCreditsColumns();

    return NextResponse.json({
      websiteInstagram: websiteInstagramResult,
      photoCredit: photoCreditResult,
      success: websiteInstagramResult.success && photoCreditResult.success,
      message: "Migrations terminées",
    });
  } catch (error) {
    console.error("Error running migrations:", error);
    return NextResponse.json(
      { error: "Failed to run migrations" },
      { status: 500 }
    );
  }
}
