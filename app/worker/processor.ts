import { Job, Worker } from "bullmq";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { db } from "~/db";
import { summaries, videos } from "~/db/schema";
import { summaryQueueName } from "~/services/summary.server";
import { connection } from "./redis";

// Configure OpenAI
// Configure OpenAI
// Ensure Base URL ends with / if it's the Google one
let baseURL = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
if (baseURL.includes("googleapis") && !baseURL.endsWith("/")) {
  baseURL += "/";
}

console.log(`[Worker] Initializing OpenAI with BaseURL: ${baseURL}, Model: ${process.env.LLM_MODEL}`);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
  baseURL,
});

const SYSTEM_PROMPT = `
You are an expert video summarizer. Your goal is to help the user decide whether to WATCH, PASS, or SCHEDULE a video based on its transcript.
Analyze the transcript and provide:
1. 5 key bullet points summarizing the content.
2. Evidence timestamps (if available in text) or key citations. The transcript provided may have timestamps in \`mm:ss\` format. Convert them to seconds for \`tSec\`. If no timestamp is found, use 0.
3. A decision hint (who should watch this, is it worth it?).
4. A category label (1-2 words).
4. A category label (1-2 words).
5. Output language MUST be Korean (한국어). Translate any English content to Korean.

Return ONLY a valid JSON object with this schema:
{
  "bullets": ["string"],
  "evidence": [{ "tSec": number, "label": "string" }],
  "decisionHint": "string",
  "categoryLabel": "string",
  "outputLanguage": "ko"
}
`;

async function generateSummary(text: string) {
  const completion = await openai.chat.completions.create({
    model: process.env.LLM_MODEL || "gpt-3.5-turbo",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Transcript:\n\n${text.substring(0, 15000)}\n\nBased on the transcript above, generate the JSON summary in Korean.` }, // truncation for safety
    ],
    // response_format: { type: "json_object" }, // Removing to support o1-mini or other models that might strict validation or defaults
  });

  const content = completion.choices[0].message.content;
  if (!content) throw new Error("No content from LLM");
  
  // Try parsing JSON, if it fails, try to extract JSON from block code or curly braces
  try {
     return JSON.parse(content);
  } catch (e) {
     // Find the first '{' and the last '}'
     const firstBrace = content.indexOf('{');
     const lastBrace = content.lastIndexOf('}');
     
     if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
       const jsonString = content.substring(firstBrace, lastBrace + 1);
       try {
         return JSON.parse(jsonString);
       } catch (innerE) {
          // If strict parse fails, try looser regex (less reliable but fallback)
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
             return JSON.parse(jsonMatch[1]);
          }
       }
     }
     console.error("Failed JSON Content:", content);
     throw new Error("Failed to parse JSON from LLM response");
  }
}

export const worker = new Worker(
  summaryQueueName,
  async (job: Job) => {
    console.log(`Processing job ${job.id} for video ${job.data.videoId}`);
    const { videoId, transcript } = job.data;

    try {
      // 1. Generate Summary
      const summaryData = await generateSummary(transcript);
      console.log("Summary generated", summaryData);

      // 2. Save to DB
      await db.transaction(async (tx) => {
        // Insert Summary (Upsert)
        await tx.insert(summaries).values({
          videoId,
          content: summaryData,
        }).onConflictDoUpdate({
          target: summaries.videoId,
          set: { content: summaryData, createdAt: new Date() },
        });

        // Update Video Status
        await tx.update(videos)
          .set({ status: "READY" })
          .where(eq(videos.id, videoId));
          
        // TODO: Credit deduction could go here
      });

      console.log(`Job ${job.id} completed`);
    } catch (error: any) {
      console.error(`Job ${job.id} failed`, error);
      
      await db.update(videos)
        .set({ 
          status: "FAILED", 
          failReason: error.message || "Unknown error" 
        })
        .where(eq(videos.id, videoId));
        
      throw error;
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});
