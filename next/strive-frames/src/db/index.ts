import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create the connection
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Helper function to test the connection
export async function testConnection() {
  try {
    const result = await client`SELECT 1`;
    return result.length > 0;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

// Export the schema
export * from "./schema";
