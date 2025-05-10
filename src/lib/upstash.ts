import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import ragChat from "@/lib/rag.server";
import { Index } from "@upstash/vector";
import { Document } from "langchain/document";
import { v4 as uuid } from "uuid";
import { summarizer } from "@/lib/groqSummarizer";

interface Metadata {
  content: string;
}
interface Vector {
  id: string;
  vector: number[];
  metadata: Metadata;
}
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "sentence-transformers/all-mpnet-base-v2",
  maxRetries: 3,
});
export const updateUpstash = async (
  index: Index,
  namespace: string,
  docs: Document[]
) => {
  const promiseList = docs.map(async (doc, counter) => {
    const text = doc["pageContent"];
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200,
    });
    const chunks = await textSplitter.createDocuments([text]);

    const embeddingsArrays = await embeddings.embedDocuments(
      chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
    );

    const batchSize = 500;
    let batch: any[] = [];
    let pageContent = "";
    const batchPromises = chunks.map(async (chunk, idx) => {
      const vector = {
        id: uuid(),
        vector: embeddingsArrays[idx],
        metadata: {
          content: chunk.pageContent,
        },
      };

      pageContent += chunk.pageContent + " ";
      batch.push(vector);

      if (batch.length === batchSize || idx === chunks.length - 1) {
        const response = await index.upsert(batch, { namespace: namespace });
        const summary: any = await summarizer(
          `You are an expert summarizer who is able to capture the key points from a text. 
          Like the authors of an article or a formula and such important topics the user might ask specifically.`,

          `Summarize the text in less than 150 words.`,
          pageContent
        );

        await ragChat.context.add({
          type: "text",
          data: summary.content,
          options: { namespace: namespace },
        });

        console.log(`Batch: ${counter} response: ${JSON.stringify(response)}`);
        batch = [];
        pageContent = "";
      }
    });

    await Promise.all(batchPromises);
  });

  await Promise.all(promiseList);
};

export const queryUpstashAndLLM = async (
  index: Index,
  namespace: string,
  sessionId: string,
  question: string
) => {
  const embeddingsArrays = await embeddings.embedDocuments([question]);
  const queryResponse: any[] = await index.query(
    {
      topK: 10,
      vector: embeddingsArrays[0],
      includeVectors: false,
      includeMetadata: true,
    },
    { namespace }
  );
  console.log("index query", queryResponse);
  if (queryResponse.length >= 1) {
    const contextPromises = queryResponse.map(async (result) => {
      try {
        const context = result?.metadata?.content;
        return ragChat.context.add({
          type: "text",
          data: context,
          options: { namespace },
        });
      } catch (err) {
        console.error(`There was an error: ${err}`);
        return Promise.resolve();
      }
    });

    await Promise.all(contextPromises);
  }

  const response = await ragChat.chat(question, {
    debug: true,
    streaming: true,
    namespace,
    sessionId,
    similarityThreshold: 0.7,
    historyLength: 5,
    topK: 5,
  });

  return response;
};
