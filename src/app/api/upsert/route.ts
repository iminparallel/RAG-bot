export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import getUserSession from "@/lib/user.server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Index } from "@upstash/vector";
import { updateUpstash } from "@/lib/upstash";
import { currentUser } from "@clerk/nextjs/server";

// Initializes Upstash VectorStore client
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

/**
 * API endpoint to Upsert PDF data to Upstash Vectorstore
 */

export async function POST(request: NextRequest) {
  //Gets User profile data to be sent as a response for Client re-rendering
  const profile = await currentUser();

  // Gets the user session first
  const user = await getUserSession();
  const namespace = user?.[1] as string; // Namespace for Vectorstore

  // Requests Forms data submitted from client
  const data = await request.formData();
  const file = data.get("file") as File; // Get file content

  // If user does not exist throws error
  if (!user) return new Response(null, { status: 403 });
  // If file does not exist throws error
  if (!file) return new Response(null, { status: 400 });

  // Converts file data to Buffer array
  const arrayBuffer = await file.arrayBuffer();
  // Creates Blob to be consumed by RecursiveCharacterTextSplitter
  const fileSource = new Blob([arrayBuffer], { type: file.type });
  // Creates PDF loader file
  const loader = new PDFLoader(fileSource, {
    splitPages: true,
  });
  // Collects the file name
  const baseName = file.name.replace(/\.[^/.]+$/, "");

  console.log("filesource", fileSource, baseName);
  // Loads the docs using Langchain PDFLoader
  const docs = await loader.load();
  console.log(docs.length);

  try {
    // Updates Upstash Vectorstore using custom function
    await updateUpstash(index, namespace, docs, baseName);
    return NextResponse.json({ message: profile?.id }, { status: 200 });
  } catch (err) {
    // Throws error if update fails
    console.log("error: ", err);
    throw new Error("Upstash Could be Updated");
    //return NextResponse.json({ message: "Failure" }, { status: 500 });
  }
}
