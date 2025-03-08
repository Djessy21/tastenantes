import { NextResponse } from "next/server";
import db from "@/app/lib/db.server";

export async function GET() {
  try {
    const restaurants = await db.query(
      "SELECT * FROM restaurants ORDER BY created_at DESC"
    );
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
    const { name, address, latitude, longitude } = body;

    const result = await db.query(
      `INSERT INTO restaurants (name, address, latitude, longitude)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, address, latitude, longitude]
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return NextResponse.json(
      { error: "Failed to create restaurant" },
      { status: 500 }
    );
  }
}
