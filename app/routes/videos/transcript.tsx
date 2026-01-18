import type { Route } from "./+types/transcript";
import { Form, useNavigate, useParams, Link } from "react-router";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { FileText, ChevronLeft, Save } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Transcript | Playlist Digest" },
  ];
}

export default function VideoTranscript() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transcript</h1>
          <p className="text-muted-foreground">Manage the transcript for Video {id}.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Edit Transcript
          </CardTitle>
          <CardDescription>
            If the automatic transcript is inaccurate or missing, you can paste the correct transcript below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form className="space-y-4">
            <Textarea 
              placeholder="Paste transcript text here..." 
              className="min-h-[500px] font-mono text-sm leading-relaxed"
              defaultValue={`[00:00] Speaker 1: Welcome to this deep dive into AI agents.
[00:05] Speaker 1: Today we are going to talk about architectural patterns.
[00:10] Speaker 1: First, let's look at memory management.
...`}
            />
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" onClick={() => navigate(-1)}>Discard Changes</Button>
          <Button className="gap-2">
            <Save className="size-4" />
            Save Transcript
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
