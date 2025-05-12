export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { NextResponse, NextRequest } from "next/server";
import getUserSession from "@/lib/user.server";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * API endpoint to get chat history from Upstash Redis
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const userSession = await getUserSession();
    if (!userSession) return new Response(null, { status: 403 });

    const userId = userSession[0];

    // Key for storing chat history in Redis
    const chatHistoryKey = `chat:history:${userId}`;

    console.log("Chat History", chatHistoryKey);

    // Get messages from Redis (stored as a list)
    const rawMessages = await redis.lrange(chatHistoryKey, 0, -1);

    return NextResponse.json({ rawMessages });
  } catch (error) {
    console.error("Error fetching chat history from Redis:", error);
    return NextResponse.json(
      { error: "Failed to retrieve chat history" },
      { status: 500 }
    );
  }
}
