import { Redis } from "@upstash/redis";

// Message type definition
export type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
  sources: string[];
};

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Get chat history for a user from Redis
 * @param userId - The user's ID
 * @param limit - Maximum number of messages to retrieve (default: 100)
 */
export async function getChatHistory(
  userId: string,
  limit = 100
): Promise<Message[]> {
  try {
    const chatHistoryKey = `chat:history:${userId}`;

    // Get messages from Redis (stored as a list)
    // LRANGE returns messages from newest to oldest when we insert with LPUSH
    const rawMessages = await redis.lrange(chatHistoryKey, 0, limit - 1);

    // Parse and reverse to get chronological order (oldest first)
    return rawMessages
      .map((msg) => {
        try {
          return JSON.parse(msg);
        } catch (e) {
          console.error("Failed to parse message:", e);
          return null;
        }
      })
      .filter(Boolean)
      .reverse();
  } catch (error) {
    console.error("Failed to get chat history from Redis:", error);
    return [];
  }
}

/**
 * Save a message to the user's chat history in Redis: Not required in current scope
 * @param userId - The user's ID
 * @param message - The message to save
 */
export async function saveMessage(
  userId: string,
  message: Message
): Promise<boolean> {
  try {
    const chatHistoryKey = `chat:history:${userId}`;

    // Add timestamp if not provided
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || Date.now(),
      sources: message.sources,
    };

    // Serialize message to JSON
    const serialized = JSON.stringify(messageWithTimestamp);

    // Add to the beginning of the list (LPUSH inserts at the beginning)
    await redis.lpush(chatHistoryKey, serialized);

    // Optional: Set expiration for the key to automatically clean up old histories
    // Remove or adjust this if you want to keep chat histories indefinitely
    await redis.expire(chatHistoryKey, 60 * 60 * 24 * 30); // 30 days

    return true;
  } catch (error) {
    console.error("Failed to save message to Redis:", error);
    return false;
  }
}

/**
 * Clear chat history for a user: Not required in current scope
 * @param userId - The user's ID
 */
export async function clearChatHistory(userId: string): Promise<boolean> {
  try {
    const chatHistoryKey = `chat:history:${userId}`;
    await redis.del(chatHistoryKey);
    return true;
  } catch (error) {
    console.error("Failed to clear chat history from Redis:", error);
    return false;
  }
}
