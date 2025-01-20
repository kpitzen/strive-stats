"use server";

import { eq } from "drizzle-orm";
import {
  db,
  characters,
  normalMoves,
  specialMoves,
  overdriveMoves,
  gatlingTables,
  systemJumpData,
  systemCoreData,
  characterSpecificTables,
} from "@/db";

export async function fetchCharacters() {
  try {
    return await db.select().from(characters);
  } catch (error) {
    console.error("Failed to fetch characters:", error);
    throw error;
  }
}

export async function fetchNormalMoves() {
  try {
    return await db.select().from(normalMoves);
  } catch (error) {
    console.error("Failed to fetch normal moves:", error);
    throw error;
  }
}

export async function fetchSpecialMoves() {
  try {
    return await db.select().from(specialMoves);
  } catch (error) {
    console.error("Failed to fetch special moves:", error);
    throw error;
  }
}

export async function fetchOverdriveMoves() {
  try {
    return await db.select().from(overdriveMoves);
  } catch (error) {
    console.error("Failed to fetch overdrive moves:", error);
    throw error;
  }
}

export async function fetchGatlingData() {
  try {
    return await db.select().from(gatlingTables);
  } catch (error) {
    console.error("Failed to fetch gatling data:", error);
    throw error;
  }
}

export async function fetchSystemJumpData() {
  try {
    return await db.select().from(systemJumpData);
  } catch (error) {
    console.error("Failed to fetch system jump data:", error);
    throw error;
  }
}

export async function fetchSystemCoreData() {
  try {
    return await db.select().from(systemCoreData);
  } catch (error) {
    console.error("Failed to fetch system core data:", error);
    throw error;
  }
}

export async function fetchCharacterSpecificTables(character?: string) {
  try {
    if (character) {
      return await db
        .select()
        .from(characterSpecificTables)
        .where(eq(characterSpecificTables.character, character));
    }
    return await db.select().from(characterSpecificTables);
  } catch (error) {
    console.error("Failed to fetch character-specific tables:", error);
    throw error;
  }
}
