import { NextResponse } from "next/server";
import { getRestaurants, createRestaurant } from "@/app/lib/db-edge";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de pagination de l'URL
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    console.log(
      `[DEBUG] GET /api/restaurants - Début de la requête: page=${page}, limit=${limit}`
    );

    // Valider les paramètres
    if (isNaN(page) || page < 1) {
      console.log("[DEBUG] Paramètre 'page' invalide");
      return NextResponse.json(
        { error: "Le paramètre 'page' doit être un nombre positif" },
        { status: 400 }
      );
    }

    if (isNaN(limit) || limit < 1 || limit > 50) {
      console.log("[DEBUG] Paramètre 'limit' invalide");
      return NextResponse.json(
        { error: "Le paramètre 'limit' doit être un nombre entre 1 et 50" },
        { status: 400 }
      );
    }

    console.log("[DEBUG] Appel à getRestaurants");
    const restaurants = await getRestaurants(page, limit);
    console.log(`[DEBUG] Restaurants récupérés: ${restaurants.length}`);

    if (restaurants.length === 0) {
      console.log("[DEBUG] Aucun restaurant trouvé");
    } else {
      console.log(
        `[DEBUG] Premier restaurant: ${JSON.stringify(restaurants[0])}`
      );
    }

    // Transformer les restaurants pour assurer la cohérence des noms de champs
    const transformedRestaurants = restaurants.map((restaurant) => {
      // Assurer que l'image est accessible via la propriété 'image'
      if (!restaurant.image && restaurant.image_url) {
        restaurant.image = restaurant.image_url;
      }

      // Si aucune image n'est définie, utiliser une image statique
      if (!restaurant.image) {
        restaurant.image = `/default-restaurant.svg`;
      }

      // Transformer les noms de champs pour correspondre à l'interface CertifiedRestaurant
      return {
        ...restaurant,
        certifiedBy: restaurant.certified_by,
        certificationDate: restaurant.certification_date,
        specialNote: restaurant.special_note,
      };
    });

    console.log(
      `[DEBUG] Restaurants transformés: ${transformedRestaurants.length}`
    );
    return NextResponse.json(transformedRestaurants);
  } catch (error) {
    console.error("[DEBUG] Error fetching restaurants:", error);
    if (error instanceof Error) {
      console.error("[DEBUG] Error message:", error.message);
      console.error("[DEBUG] Error stack:", error.stack);
    }
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
      website,
      instagram,
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
      image_url || "",
      website || "",
      instagram || ""
    );

    // Transformer le restaurant pour assurer la cohérence des noms de champs
    const transformedRestaurant = {
      ...restaurant,
      image: restaurant.image || image_url || `/default-restaurant.svg`,
      certifiedBy: restaurant.certified_by,
      certificationDate: restaurant.certification_date,
      specialNote: restaurant.special_note,
      website: restaurant.website,
      instagram: restaurant.instagram,
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
