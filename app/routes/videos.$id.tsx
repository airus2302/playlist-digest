import { formatDistanceToNow } from "date-fns";
import { eq } from "drizzle-orm";
import { Calendar, CheckCircle, ExternalLink, RefreshCcw, XCircle } from "lucide-react";
import { Form, redirect, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { db } from "~/db";
import { videos } from "~/db/schema";
import { auth } from "~/services/auth/index.server";
import { makeDecision, type DecisionType } from "~/services/decision.server";
import { addSummaryJob } from "~/services/summary.server";
export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await auth.requireUser(request);
  const videoId = parseInt(params.id!);
  
  let video = await db.query.videos.findFirst({
    where: (videos, { and, eq }) => and(eq(videos.id, videoId), eq(videos.userId, user.id)),
  });

  if (!video) throw new Response("Not Found", { status: 404 });

  // Fetch summary separately to ensure we get it
  const summary = await db.query.summaries.findFirst({
    where: (summaries, { eq }) => eq(summaries.videoId, videoId),
  });

  return { video: { ...video, summary } }; // Attach manually
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await auth.requireUser(request);
  const videoId = parseInt(params.id!);
  const formData = await request.formData();
  const decision = formData.get("decision") as DecisionType;
  const intent = formData.get("intent");

  if (intent === "retry") {
    // Retry Logic
    const video = await db.query.videos.findFirst({
        where: (videos, { and, eq }) => and(eq(videos.id, videoId), eq(videos.userId, user.id)),
    });
    
    if (video && video.transcript) {
        await db.update(videos).set({ status: "PENDING", failReason: null }).where(eq(videos.id, videoId));
        await addSummaryJob(videoId, video.transcript);
    }
    return null;
  }
  
  if (!decision) return { error: "Invalid Decision" };

  // For SCHEDULE, we might need a date. For MVP just standard schedule?
  // PRD: "SCHEDULE은 날짜 도래 시 상단 노출". Simple implementation: scheduled for tomorrow?
  // Or parse date from form. Let's assume +1 day for MVP simplicity if not provided.
  await makeDecision(user.id, videoId, decision, new Date(Date.now() + 86400000));

  return redirect("/videos");
}

// Helper to format seconds to mm:ss
function formatTime(seconds: number) {
  if (seconds === null || seconds === undefined) return "N/A";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoDetail() {
  const { video } = useLoaderData<typeof loader>();
  const summary = video.summary?.content as any; // Type lazily

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      {/* Debug Info: Remove later */}
      <details className="mb-4 p-2 bg-gray-100 rounded text-xs">
        <summary>Debug Video Object</summary>
        <pre>{JSON.stringify(video, null, 2)}</pre>
      </details>
      <div className="flex gap-4">
        {/* ... (Video Header remains same, skipping for brevity in replacement if possible, but context needed) */}
        <div className="w-1/3">
           <img 
              src={video.thumbnailUrl || ""} 
              alt={video.title} 
              className="w-full rounded-lg shadow-md"
            />
        </div>
        <div className="flex-1 space-y-2">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <p className="text-gray-500">{video.channelTitle} • {video.duration ? `${Math.floor(video.duration/60)} mins` : "Unknown duration"}</p>
            <div className="flex gap-2">
               <a href={`https://youtu.be/${video.youtubeVideoId}`} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 hover:underline">
                 Watch on YouTube <ExternalLink className="ml-1 h-4 w-4" />
               </a>
            </div>
             <Badge variant="outline">{video.status}</Badge>
        </div>
      </div>

      {video.status === "READY" && summary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="md:col-span-2">
             <CardHeader>
               <CardTitle>Digest</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               {summary.categoryLabel && (
                 <Badge>{summary.categoryLabel}</Badge>
               )}
               <div className="bg-muted p-4 rounded-md">
                 <h3 className="font-semibold mb-2">Decision Hint</h3>
                 <p>{summary.decisionHint}</p>
               </div>
               
               <div>
                  <h3 className="font-semibold mb-2">Key Points</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {summary.bullets?.map((b: string, i: number) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
               </div>

               {summary.evidence && summary.evidence.length > 0 && (
                 <div>
                    <h3 className="font-semibold mb-2">Evidence</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {summary.evidence.map((e: any, i: number) => (
                        <li key={i} className="flex items-start">
                          <span className="font-mono bg-gray-100 px-1 rounded mr-2 mt-0.5 text-xs">
                            {formatTime(e.tSec)}
                          </span>
                          <span>{e.label}</span>
                        </li>
                      ))}
                    </ul>
                 </div>
               )}
             </CardContent>
           </Card>

           <div className="space-y-4">
             <Card>
               <CardHeader>
                 <CardTitle>Decision</CardTitle>
               </CardHeader>
               <CardContent className="flex flex-col gap-2">
                 {/* Dev Helper: Regenerate */}
                 <Form method="post" className="mb-2">
                    <input type="hidden" name="intent" value="retry" />
                    <Button type="submit" variant="ghost" size="sm" className="w-full text-xs text-gray-400">
                        <RefreshCcw className="mr-2 h-3 w-3" /> Regenerate Summary (Dev)
                    </Button>
                 </Form>

                  <Form method="post">
                    <input type="hidden" name="decision" value="WATCH" />
                    <Button className="w-full" variant="default" type="submit">
                      <CheckCircle className="mr-2 h-4 w-4" /> Watch Now
                    </Button>
                  </Form>
                  <Form method="post">
                    <input type="hidden" name="decision" value="PASS" />
                    <Button className="w-full" variant="secondary" type="submit">
                      <XCircle className="mr-2 h-4 w-4" /> Pass / Archive
                    </Button>
                  </Form>
                  <Form method="post">
                    <input type="hidden" name="decision" value="SCHEDULE" />
                    <Button className="w-full" variant="outline" type="submit">
                      <Calendar className="mr-2 h-4 w-4" /> Schedule (TBD)
                    </Button>
                  </Form>
               </CardContent>
             </Card>
           </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
              <div className="flex flex-col items-center gap-4">
                  <p>Digest not ready. Current Status: <span className="font-bold">{video.status}</span></p>
                  
                  {/* Allow regeneration even in weird states */}
                  {video.transcript && (
                    <Form method="post">
                        <input type="hidden" name="intent" value="retry" />
                        <Button type="submit" variant="outline" size="sm">
                            <RefreshCcw className="mr-2 h-4 w-4" /> Force Regenerate
                        </Button>
                    </Form>
                  )}
              </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
