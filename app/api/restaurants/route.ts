import { NextResponse } from "next/server";
import { getRestaurants, createRestaurant } from "@/app/lib/db-edge";

export const runtime = "edge";

export async function GET() {
  try {
    const restaurants = await getRestaurants();
    return NextResponse.json(restaurants);
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
    const body = await request.json();
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
    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return NextResponse.json(
      { error: "Failed to create restaurant" },
      { status: 500 }
    );
  }
}
