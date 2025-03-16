import { NextRequest, NextResponse } from "next/server";
import { getRestaurantById } from "@/app/lib/db-edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID du restaurant requis" },
        { status: 400 }
      );
    }

    // Récupérer les détails du restaurant
    const restaurant = await getRestaurantById(id);

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant non trouvé" },
        { status: 404 }
      );
    }

    // Retourner les détails complets du restaurant pour débogage
    return NextResponse.json({
      restaurant: {
        ...restaurant,
        // Ajouter des champs transformés pour la cohérence
        image:
          restaurant.image || restaurant.image_url || `/default-restaurant.svg`,
        certifiedBy: restaurant.certified_by,
        certificationDate: restaurant.certification_date,
        specialNote: restaurant.special_note,
      },
      debug: {
        timestamp: new Date().toISOString(),
        imageFields: {
          image: restaurant.image,
          image_url: restaurant.image_url,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors du débogage du restaurant:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du débogage du restaurant",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
