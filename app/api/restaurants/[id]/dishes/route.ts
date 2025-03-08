import { NextResponse } from "next/server";
import { getDishes } from "@/app/lib/db-edge";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = parseInt(params.id);
    if (isNaN(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID" },
        { status: 400 }
      );
    }

    const dishes = await getDishes(restaurantId);

    // Transformer les plats pour assurer la cohérence des URLs d'images
    const transformedDishes = dishes.map((dish) => {
      // Si aucune image n'est définie, utiliser une image placeholder
      if (!dish.image_url) {
        dish.image_url = "https://placehold.co/400x300?text=Plat";
      }
      return dish;
    });

    return NextResponse.json(transformedDishes);
  } catch (error) {
    console.error("Error fetching dishes:", error);
    return NextResponse.json(
      { error: "Failed to fetch dishes" },
      { status: 500 }
    );
  }
}
