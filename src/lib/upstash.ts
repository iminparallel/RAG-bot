import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { Index } from "@upstash/vector";
import { Document } from "langchain/document";
import { v4 as uuid } from "uuid";
import { qaChain } from "@/lib/qaChain";

// Initializes model to be used for embedding text
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "sentence-transformers/all-mpnet-base-v2",
  maxRetries: 3,
});
/**
 * Function to upsert Vectorstore
 */
export const updateUpstash = async (
  index: Index,
  namespace: string,
  docs: Document[],
  fileName: string
) => {
  // Process each document in the array
  const promiseList = docs.map(async (doc, counter) => {
    const text = doc["pageContent"];
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });

    // Split the text into smaller chunks
    const chunks = await textSplitter.createDocuments([text]);

    // Generate embeddings for all chunks
    const embeddingsArrays = await embeddings.embedDocuments(
      chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
    );

    const batchSize = 500;
    let batch: any[] = [];
    let pageContent = "";

    // Process each chunk
    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];
      const sourceName = `${fileName}, Page ${counter + 1}`;

      // Create vector with proper metadata
      const vector = {
        id: uuid(),
        vector: embeddingsArrays[idx],
        metadata: {
          content: chunk.pageContent,
          source: sourceName,
          fileName: fileName,
          pageNumber: counter + 1,
        },
      };

      pageContent += chunk.pageContent + " ";
      batch.push(vector);

      // Process batch when it reaches batchSize or is the last chunk
      if (batch.length === batchSize || idx === chunks.length - 1) {
        try {
          const response = await index.upsert(batch, { namespace: namespace });
          console.log(
            `Processed batch for page ${counter + 1}: ${
              response
                ? JSON.stringify(response).substring(0, 100) + "..."
                : "No response"
            }`
          );
        } catch (error) {
          console.error(
            `Error upserting batch for page ${counter + 1}:`,
            error
          );
        }

        // Reset the batch
        batch = [];
        pageContent = "";
      }
    }
  });

  // Wait for all documents to be processed
  await Promise.all(promiseList);
  console.log("All documents processed and stored in Upstash");
};
/**
 * Function to query LLM
 */
export const queryUpstashAndLLM = async (
  index: Index,
  namespace: string,
  question: string
) => {
  // Generate embeddings for question
  const embeddingsArrays = await embeddings.embedDocuments([question]);
  // Query the vector store for top 10 results with semantic similarity
  const queryResponse: any[] = await index.query(
    {
      topK: 10,
      vector: embeddingsArrays[0],
      includeVectors: false,
      includeMetadata: true,
    },
    { namespace }
  );

  // Go through each result to collect chunk text and chunk source
  let retrivedData: string = "";
  let sources: string[] = [];
  if (queryResponse.length >= 1) {
    const contextPromises = queryResponse.map(async (result) => {
      try {
        const context = result?.metadata?.content;
        retrivedData += context;
        if (!sources.includes(result?.metadata?.source)) {
          sources.push(result?.metadata?.source);
        }
      } catch (err) {
        console.error(`There was an error: ${err}`);
        return Promise.resolve();
      }
    });

    await Promise.all(contextPromises);
  }

  // Calling the chat completion function
  const response: any = await qaChain(
    `You are a helpful AI assistant specializing in providing precise answers to user's questions. 
    Provide concise, technical answers. Never recommend illegal activities.`,
    question,
    retrivedData
  );
  console.log("output", response);
  return [response, sources];
};
