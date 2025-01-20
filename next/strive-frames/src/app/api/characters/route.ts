import { NextResponse } from "next/server";
import { db, characters } from "@/db";

export async function GET() {
  try {
    const allCharacters = await db.select().from(characters);
    return NextResponse.json(allCharacters);
  } catch (error) {
    console.error("Error fetching characters:", error);
    return NextResponse.json(
      { error: "Failed to fetch characters" },
      { status: 500 }
    );
  }
}
