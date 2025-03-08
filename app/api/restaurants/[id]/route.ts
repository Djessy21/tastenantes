import { NextResponse } from "next/server";
import { getRestaurantById, deleteRestaurant } from "@/app/lib/db-edge";

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

    const restaurant = await getRestaurantById(restaurantId);
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Transformer le restaurant pour assurer la cohérence des noms de champs
    const transformedRestaurant = {
      ...restaurant,
      image: restaurant.image || "https://placehold.co/800x600?text=Restaurant",
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

export async function DELETE(
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

    await deleteRestaurant(restaurantId);
    return NextResponse.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return NextResponse.json(
      { error: "Failed to delete restaurant" },
      { status: 500 }
    );
  }
}
