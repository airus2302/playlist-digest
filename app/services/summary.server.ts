import { Queue } from "bullmq";
import { connection } from "~/worker/redis";

export const summaryQueueName = "summary-queue";

export const summaryQueue = new Queue(summaryQueueName, {
  connection,
});

export async function addSummaryJob(videoId: number, transcript: string) {
  await summaryQueue.add("generate-summary", {
    videoId,
    transcript,
  });
}
