import { NextResponse } from "next/server";
import { getRestaurants, createRestaurant } from "@/app/lib/db-edge";

export const runtime = "edge";

export async function GET() {
  try {
    const restaurants = await getRestaurants();

    // Transformer les restaurants pour assurer la cohérence des noms de champs
    const transformedRestaurants = restaurants.map((restaurant) => {
      // Assurer que l'image est accessible via la propriété 'image'
      if (!restaurant.image && restaurant.image_url) {
        restaurant.image = restaurant.image_url;
      }

      // Si aucune image n'est définie, utiliser une image placeholder
      if (!restaurant.image) {
        restaurant.image = "https://placehold.co/800x600?text=Restaurant";
      }

      // Transformer les noms de champs pour correspondre à l'interface CertifiedRestaurant
      return {
        ...restaurant,
        certifiedBy: restaurant.certified_by,
        certificationDate: restaurant.certification_date,
        specialNote: restaurant.special_note,
      };
    });

    return NextResponse.json(transformedRestaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST /api/restaurants - Début de la requête");
    const body = await request.json();
    console.log("Données reçues:", JSON.stringify(body));

    const {
      name,
      address,
      latitude,
      longitude,
      rating,
      cuisine,
      specialNote,
      certifiedBy,
      certificationDate,
      featured,
      image_url,
    } = body;

    console.log("Création du restaurant:", name);
    const restaurant = await createRestaurant(
      name,
      address,
      latitude,
      longitude,
      rating,
      cuisine,
      specialNote,
      certifiedBy,
      certificationDate,
      featured,
      image_url || ""
    );

    // Transformer le restaurant pour assurer la cohérence des noms de champs
    const transformedRestaurant = {
      ...restaurant,
      image:
        restaurant.image ||
        image_url ||
        "https://placehold.co/800x600?text=Restaurant",
      certifiedBy: restaurant.certified_by,
      certificationDate: restaurant.certification_date,
      specialNote: restaurant.special_note,
    };

    console.log("Restaurant créé avec succès:", transformedRestaurant);
    return NextResponse.json(transformedRestaurant);
  } catch (error) {
    console.error("Error creating restaurant:", error);
    // Afficher plus de détails sur l'erreur
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Failed to create restaurant",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
