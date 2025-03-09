import { NextResponse } from "next/server";
import {
  addWebsiteInstagramColumns,
  addPhotoCreditsColumns,
} from "@/app/lib/db-migration";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    // Exécuter les migrations
    const websiteInstagramResult = await addWebsiteInstagramColumns();
    const photoCreditsResult = await addPhotoCreditsColumns();

    if (websiteInstagramResult.success && photoCreditsResult.success) {
      return NextResponse.json({
        message: "Toutes les migrations ont été exécutées avec succès",
        details: {
          websiteInstagram: websiteInstagramResult.message,
          photoCredits: photoCreditsResult.message,
        },
      });
    } else {
      return NextResponse.json(
        {
          error: "Certaines migrations ont échoué",
          details: {
            websiteInstagram: websiteInstagramResult.success
              ? websiteInstagramResult.message
              : websiteInstagramResult.error,
            photoCredits: photoCreditsResult.success
              ? photoCreditsResult.message
              : photoCreditsResult.error,
          },
        },
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
