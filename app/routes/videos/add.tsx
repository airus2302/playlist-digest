import type { Route } from "./+types/add";
import { Form, useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Youtube, Link as LinkIcon, AlertCircle } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Add Video | Playlist Digest" },
  ];
}

export default function AddVideo() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Video</h1>
        <p className="text-muted-foreground">Add a new YouTube video to your collection for summarization.</p>
      </div>

      <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
        <div className="h-2 bg-primary" />
        <CardHeader>
          <CardTitle>Video URL</CardTitle>
          <CardDescription>Paste the YouTube video link below. We'll fetch the details and generate a summary.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url">YouTube URL</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Youtube className="size-5" />
                </div>
                <Input 
                  id="url" 
                  name="url" 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <p className="text-xs text-muted-foreground">Supported: YouTube videos, Shorts, and Live stream recordings.</p>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 flex gap-3">
              <AlertCircle className="size-5 text-blue-600 shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-semibold">Pro Tip</p>
                <p>You can also paste a playlist URL to add multiple videos at once!</p>
              </div>
            </div>
          </Form>
        </CardContent>
        <CardFooter className="bg-muted/50 p-6 flex justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button size="lg" onClick={() => navigate("/videos/1")}>Add & Summarize</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
