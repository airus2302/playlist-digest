import { eq } from "drizzle-orm";
import { Loader2 } from "lucide-react";
import { type ActionFunctionArgs, Form, type LoaderFunctionArgs, redirect, useActionData, useNavigation } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { db } from "~/db";
import { videos } from "~/db/schema";
import { auth } from "~/services/auth/index.server";
import { addSummaryJob } from "~/services/summary.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await auth.requireUser(request);
  const videoId = parseInt(params.id!);
  
  if (isNaN(videoId)) throw new Response("Invalid ID", { status: 400 });

  const video = await db.query.videos.findFirst({
    where: (videos, { and, eq }) => and(eq(videos.id, videoId), eq(videos.userId, user.id)),
  });

  if (!video) throw new Response("Video not found", { status: 404 });

  return { video };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await auth.requireUser(request);
  const videoId = parseInt(params.id!);
  
  const formData = await request.formData();
  const transcript = formData.get("transcript") as string;

  if (!transcript || transcript.trim().length === 0) {
    return { error: "Transcript cannot be empty" };
  }

  // Save Transcript to DB
  await db.update(videos)
    .set({ transcript })
    .where(eq(videos.id, videoId));

  // Enqueue Job
  await addSummaryJob(videoId, transcript);

  return redirect(`/videos/${videoId}`);
}

export default function PasteTranscript() {
  const navigation = useNavigation();
  const actionData = useActionData<{ error?: string }>();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Paste Transcript</CardTitle>
          <CardDescription>
            Copy the full transcript from YouTube and paste it here. We will generate the summary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {actionData?.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{actionData.error}</AlertDescription>
            </Alert>
          )}

          <Form method="post" className="space-y-4">
            <Textarea 
              name="transcript" 
              placeholder="Paste transcript text here..." 
              className="min-h-[300px] font-mono text-sm"
              required
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Summary
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
