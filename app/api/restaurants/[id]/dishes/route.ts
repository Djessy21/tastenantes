import { NextRequest, NextResponse } from "next/server";
import { getDishes, createDish } from "@/app/lib/db-edge";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(
      `API Dishes: Récupération des plats pour le restaurant ${params.id}`
    );
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
      // Si aucune image n'est définie, utiliser une image statique
      if (!dish.image_url) {
        dish.image_url = `/default-dish.svg`;
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`API Dishes: Ajout d'un plat pour le restaurant ${params.id}`);
    const restaurantId = parseInt(params.id);
    if (isNaN(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, price, imageUrl, photo_credit } = body;

    // Vérifier que les champs requis sont présents
    if (!name || !price) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    console.log(`Création du plat: ${name} pour le restaurant ${restaurantId}`);
    const dish = await createDish(
      restaurantId,
      name,
      description || "",
      price,
      imageUrl || "",
      photo_credit || ""
    );

    console.log(`Plat créé avec succès: ${dish.id}`);
    return NextResponse.json(dish);
  } catch (error) {
    console.error("Error creating dish:", error);
    return NextResponse.json(
      { error: "Failed to create dish" },
      { status: 500 }
    );
  }
}
