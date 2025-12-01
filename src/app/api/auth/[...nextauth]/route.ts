export const runtime = "nodejs";

import { handlers } from "@/auth";

export async function GET(...args: Parameters<typeof handlers.GET>) {
  try {
    return await handlers.GET(...args);
  } catch (error) {
    console.error("NextAuth GET error:", error);
    throw error;
  }
}

export async function POST(...args: Parameters<typeof handlers.POST>) {
  try {
    return await handlers.POST(...args);
  } catch (error) {
    console.error("NextAuth POST error:", error);
    throw error;
  }
}

