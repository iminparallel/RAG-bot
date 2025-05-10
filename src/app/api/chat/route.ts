export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const maxDuration = 60;

import type { Message } from "ai";
import { Index } from "@upstash/vector";
import { aiUseChatAdapter } from "@upstash/rag-chat/nextjs";
import getUserSession from "@/lib/user.server";
import { queryUpstashAndLLM } from "@/lib/upstash";
import { NextRequest, NextResponse } from "next/server";

interface ChatRequest {
  upload: string;
  sessionId: string;
  namespace: string;
  messages: Message[];
}

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

export async function POST(request: NextRequest) {
  const user = await getUserSession();
  const namespaceList = await new Index().listNamespaces();
  const { messages } = (await request.json()) as ChatRequest;
  const question: string | undefined = messages.at(-1)?.content;
  const sessionId = user?.[0] as string;
  const namespace = user?.[1] as string;
  if (!user) return new Response(null, { status: 403 });

  if (!question)
    return new Response("No question in the request.", { status: 401 });
  if (!namespaceList.includes(namespace)) {
    return NextResponse.json("This Namespace has not been created.", {
      status: 404,
    });
  }

  let response: any;
  try {
    response = await queryUpstashAndLLM(index, namespace, sessionId, question);
  } catch {
    return NextResponse.json(
      "Unable to get response from model, contact the developer team.",
      {
        status: 401,
      }
    );
  }

  return aiUseChatAdapter(response /*, "sources"*/);
}
