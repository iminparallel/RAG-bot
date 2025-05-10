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

export async function POST(request: NextRequest) {
  const profile = await currentUser();
  const data = await request.formData();
  const file = data.get("file") as File;
  const user = await getUserSession();
  const namespace = user?.[1] as string;

  if (!user) return new Response(null, { status: 403 });

  if (!file) return new Response(null, { status: 400 });
  const arrayBuffer = await file.arrayBuffer();
  const fileSource = new Blob([arrayBuffer], { type: file.type });
  const loader = new PDFLoader(fileSource, {
    splitPages: true,
  });
  console.log("filesource", fileSource, file.name);
  const docs = await loader.load();
  console.log(docs.length);

  const index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
  });

  try {
    await updateUpstash(index, namespace, docs);
    return NextResponse.json({ message: profile?.id }, { status: 200 });
  } catch (err) {
    console.log("error: ", err);
    throw new Error("Upstash Could be Updated");
    //return NextResponse.json({ message: "Failure" }, { status: 500 });
  }
}
