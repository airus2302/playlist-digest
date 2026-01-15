import { eq } from "drizzle-orm";
import { db } from "~/db";
import { videos } from "~/db/schema";

export type DecisionType = "WATCH" | "PASS" | "SCHEDULE";

export async function makeDecision(userId: string, videoId: number, decision: DecisionType, scheduledAt?: Date) {
  // Verify ownership
  const video = await db.query.videos.findFirst({
    where: (videos, { and, eq }) => and(eq(videos.id, videoId), eq(videos.userId, userId)),
  });

  if (!video) throw new Error("Video not found");

  const statusMap: Record<DecisionType, "DECIDED_WATCH" | "DECIDED_PASS" | "DECIDED_SCHEDULED"> = {
    "WATCH": "DECIDED_WATCH",
    "PASS": "DECIDED_PASS",
    "SCHEDULE": "DECIDED_SCHEDULED",
  };

  await db.update(videos)
    .set({
      status: statusMap[decision],
      decidedAt: new Date(),
      scheduledAt: decision === "SCHEDULE" ? scheduledAt : null,
    })
    .where(eq(videos.id, videoId));
    
  return { success: true };
}
