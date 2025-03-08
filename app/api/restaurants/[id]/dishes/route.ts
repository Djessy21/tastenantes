import { NextResponse } from "next/server";
import { getDishes, createDish } from "@/app/lib/db-edge";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = parseInt(params.id);
    const dishes = await getDishes(restaurantId);
    return NextResponse.json(dishes);
  } catch (error) {
    console.error("Error fetching dishes:", error);
    return NextResponse.json(
      { error: "Failed to fetch dishes" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = parseInt(params.id);
    const { name, description, price, imageUrl } = await request.json();

    const dish = await createDish(
      restaurantId,
      name,
      description,
      price,
      imageUrl
    );
    return NextResponse.json(dish);
  } catch (error) {
    console.error("Error creating dish:", error);
    return NextResponse.json(
      { error: "Failed to create dish" },
      { status: 500 }
    );
  }
}
