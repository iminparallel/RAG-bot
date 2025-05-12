export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const maxDuration = 60;

import { Index } from "@upstash/vector";
import getUserSession from "@/lib/user.server";
import { queryUpstashAndLLM } from "@/lib/upstash";
import { NextRequest, NextResponse } from "next/server";
import { saveMessage } from "@/lib/redisChat"; // Import our Redis utility

// Initialize Upstash Vectorstore client
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

/**
 * API endpoint to get chat completion from langchain
 */

export async function POST(request: NextRequest) {
  try {
    // Get the user session first
    const user = await getUserSession();
    if (!user) return new Response(null, { status: 403 });
    const sessionId = user[0]; //SessionId for Redis Cache
    const namespace = user[1]; //Namespece for Vector Store

    // Parse the request body only once
    const requestBody = await request.json();
    // Gets user prompt
    const question = requestBody.user_prompt;

    // Check if namespace exists
    const namespaceList = await index.listNamespaces();

    // If Namespace is non existant throw error
    if (!namespaceList.includes(namespace)) {
      return NextResponse.json(
        {
          content:
            "This Namespace has not been created. Please upload a document first.",
        },
        {
          status: 404,
        }
      );
    }

    // If question is non existent throw error
    if (!question) {
      return NextResponse.json(
        { content: "No question provided in request." },
        { status: 400 }
      );
    }

    // Save the user's message to Redis
    await saveMessage(sessionId, {
      role: "user",
      content: question,
      sources: [],
    });

    // Query the vector store and LLM
    const response = await queryUpstashAndLLM(index, namespace, question);
    const result = response[0]; // LLM's answer
    let sources = response[1]; // Source Data

    // Format the response
    let responseContent = "";
    if (typeof result === "object" && result?.content) {
      responseContent = result.content;
    } else {
      responseContent = result as string;
    }

    if (!sources.length) {
      sources = ["No Sources"];
    }

    // Save the assistant's message to Redis
    await saveMessage(sessionId, {
      role: "assistant",
      content: responseContent,
      sources: sources,
    });

    // Return the result properly formatted for the frontend
    return NextResponse.json(
      { content: responseContent, sources: sources },
      { status: 200 }
    );
  } catch (err) {
    // If the chat completions fails throws error
    console.error("Error during chat processing:", err);
    return NextResponse.json(
      { content: "Failed to generate answer. Contact the developer team." },
      { status: 500 }
    );
  }
}
