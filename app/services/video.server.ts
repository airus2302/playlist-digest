import { eq } from "drizzle-orm";
import { db } from "~/db";
import { videos } from "~/db/schema";

export async function parseYoutubeId(url: string): Promise<string | null> {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

interface VideoMetadata {
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration?: number; // seconds, might be missing if we use oembed
  publishedAt?: Date;
}

// Stub implementation: In a real app, use YouTube Data API
async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch oembed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      title: data.title,
      channelTitle: data.author_name,
      thumbnailUrl: data.thumbnail_url,
      duration: 0, // oembed doesn't provide duration, setting 0 for now
      publishedAt: new Date(), // oembed doesn't provide publishedAt
    };
  } catch (error) {
    console.warn("Failed to fetch metadata, using fallback", error);
    // Fallback or rethrow depending on requirement.
    // PRD says "메타 조회 실패(비공개/삭제 등) 시 FAILED(VIDEO_UNAVAILABLE) 처리"
    // For now, let's allow it to fail or return partial.
    throw error;
  }
}

export async function addVideo(userId: string, url: string) {
  const videoId = await parseYoutubeId(url);
  
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  // Check strict duplication per user
  const existing = await db.query.videos.findFirst({
    where: (videos, { and, eq }) => and(eq(videos.userId, userId), eq(videos.youtubeVideoId, videoId)),
  });

  if (existing) {
    return existing;
  }

  let metadata: VideoMetadata = {
    title: `Video ${videoId}`,
    channelTitle: "Unknown Channel",
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    duration: 0,
    publishedAt: new Date(),
  };

  try {
    metadata = await fetchVideoMetadata(videoId);
  } catch (e) {
    // If metadata fails, we might still want to add it but mark as FAILED?
    // PRD: "메타 조회 실패(비공개/삭제 등) 시 FAILED(VIDEO_UNAVAILABLE) 처리"
    // So if completely totally failed, maybe we shouldn't insert or insert as FAILED.
    // Let's insert as PENDING but with fallback title to allow retry/view?
    // Actually PRD SAYS: FAILED(VIDEO_UNAVAILABLE).
    // Let's defer that logic to a worker or handle here. 
    // Implementing synchronous fetch here for MVP simplicity.
    const [failedVideo] = await db.insert(videos).values({
      userId,
      youtubeVideoId: videoId,
      title: "Unknown Video",
      status: "FAILED",
      failReason: "VIDEO_UNAVAILABLE",
    }).returning();
    return failedVideo;
  }

  const [newVideo] = await db.insert(videos).values({
    userId,
    youtubeVideoId: videoId,
    title: metadata.title,
    channelTitle: metadata.channelTitle,
    thumbnailUrl: metadata.thumbnailUrl,
    duration: metadata.duration,
    publishedAt: metadata.publishedAt,
    status: "PENDING", // Ready for transcript
  }).returning();

  return newVideo;
}

export async function getUserVideos(userId: string) {
  return db.query.videos.findMany({
    where: eq(videos.userId, userId),
    orderBy: (videos, { desc }) => [desc(videos.createdAt)],
  });
}
