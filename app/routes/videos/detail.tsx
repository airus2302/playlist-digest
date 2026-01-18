import type { Route } from "./+types/detail";
import { Link, useParams } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Button, buttonVariants } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Youtube, Clock, Calendar, Share2, Download, Trash2, CheckCircle2, XCircle, FileText } from "lucide-react";
import { cn } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Video Detail | Playlist Digest" },
  ];
}

export default function VideoDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/videos" className="text-sm text-muted-foreground hover:text-primary">Videos</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Video {id}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Building a Production-Grade AI Agent</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon"><Share2 className="size-4" /></Button>
          <Button variant="outline" size="icon"><Download className="size-4" /></Button>
          <Button variant="outline" size="icon" className="text-destructive"><Trash2 className="size-4" /></Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Youtube className="size-20 text-red-600" />
            <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="font-bold">Watch on YouTube</p>
            </div>
          </div>

          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary to-purple-500" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="size-6 text-primary" />
                  Summary
                </CardTitle>
                <Badge className="bg-primary/10 text-primary border-primary/20">AI Generated</Badge>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-lg font-medium leading-relaxed">
                This video explores the essential architectural patterns for building robust, production-ready AI agents using modern LLM frameworks.
              </p>
              <h3 className="text-xl font-bold mt-6 mb-3">Key Takeaways</h3>
              <ul className="space-y-2">
                <li><strong>Memory Management:</strong> Implementing short-term and long-term memory using vector databases.</li>
                <li><strong>Tool Use:</strong> How to safely grant agents access to external APIs and local functions.</li>
                <li><strong>Error Handling:</strong> Strategies for dealing with hallucination and unexpected tool outputs.</li>
                <li><strong>Observability:</strong> Tracking agent reasoning steps and cost management.</li>
              </ul>
              <h3 className="text-xl font-bold mt-6 mb-3">Conclusion</h3>
              <p>
                Building agents is 10% prompt engineering and 90% software engineering. Focus on the plumbing to make your agents reliable.
              </p>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t flex justify-between p-6">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Clock className="size-4" /> 12:45</span>
                <span className="flex items-center gap-1.5"><Calendar className="size-4" /> Jan 18, 2026</span>
              </div>
              <Link to={`/videos/${id}/transcript`} className={cn(buttonVariants({ variant: "ghost" }), "gap-2")}>
                <FileText className="size-4" />
                View Transcript
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Decision</CardTitle>
              <CardDescription>Based on the summary, what's your next move?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full h-12 text-lg gap-2" variant="default">
                <CheckCircle2 className="size-5" />
                Watch Later
              </Button>
              <Button className="w-full h-12 text-lg gap-2" variant="outline">
                <XCircle className="size-5" />
                Not Interested
              </Button>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Assign to Category</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">Tech</Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">AI</Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">Coding</Badge>
                  <Button variant="ghost" size="xs" className="rounded-full"><PlusCircle className="size-3 mr-1" /> Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Channel</span>
                <span className="font-medium">Tech Explained</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">45K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language</span>
                <span className="font-medium">English</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PlusCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}
