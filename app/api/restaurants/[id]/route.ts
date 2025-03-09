import { NextResponse } from "next/server";
import {
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} from "@/app/lib/db-edge";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID" },
        { status: 400 }
      );
    }

    const restaurant = await getRestaurantById(id);
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Transformer le restaurant pour assurer la cohérence des noms de champs
    const transformedRestaurant = {
      ...restaurant,
      image:
        restaurant.image || restaurant.image_url || `/default-restaurant.svg`,
      certifiedBy: restaurant.certified_by,
      certificationDate: restaurant.certification_date,
      specialNote: restaurant.special_note,
    };

    return NextResponse.json(transformedRestaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      address,
      cuisine,
      specialNote,
      certifiedBy,
      featured,
      website,
      instagram,
      image,
      location,
      photo_credit,
    } = body;

    // Vérifier si le restaurant existe
    const existingRestaurant = await getRestaurantById(id);
    if (!existingRestaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Mettre à jour le restaurant
    const updatedRestaurant = await updateRestaurant(
      id,
      name,
      address,
      location?.lat || existingRestaurant.latitude,
      location?.lng || existingRestaurant.longitude,
      cuisine,
      specialNote,
      certifiedBy,
      featured,
      image || existingRestaurant.image || "",
      website || "",
      instagram || "",
      photo_credit || existingRestaurant.photo_credit || ""
    );

    // Transformer le restaurant pour assurer la cohérence des noms de champs
    const transformedRestaurant = {
      ...updatedRestaurant,
      image:
        updatedRestaurant.image ||
        updatedRestaurant.image_url ||
        `/default-restaurant.svg`,
      certifiedBy: updatedRestaurant.certified_by,
      certificationDate: updatedRestaurant.certification_date,
      specialNote: updatedRestaurant.special_note,
    };

    return NextResponse.json(transformedRestaurant);
  } catch (error) {
    console.error("Error updating restaurant:", error);
    return NextResponse.json(
      { error: "Failed to update restaurant" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID" },
        { status: 400 }
      );
    }

    // Vérifier si le restaurant existe
    const restaurant = await getRestaurantById(id);
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Supprimer le restaurant
    await deleteRestaurant(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return NextResponse.json(
      { error: "Failed to delete restaurant" },
      { status: 500 }
    );
  }
}
