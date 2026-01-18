import type { Route } from "./+types/list";
import { Link } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button, buttonVariants } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Search, Plus, Filter, Play, Clock, MoreVertical, ArrowRight } from "lucide-react";
import { cn } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Videos | Playlist Digest" },
  ];
}

const mockVideos = [
  { id: "1", title: "Building a Production-Grade AI Agent", duration: "12:45", status: "Summarized", category: "Tech", date: "2026-01-18" },
  { id: "2", title: "Why OKLCH is the Best Color Space", duration: "08:20", status: "Pending", category: "Design", date: "2026-01-17" },
  { id: "3", title: "Minimalist Productivity Systems", duration: "15:10", status: "Summarized", category: "Life", date: "2026-01-16" },
  { id: "4", title: "Next.js vs Remix in 2026", duration: "22:30", status: "Processing", category: "Tech", date: "2026-01-15" },
];

export default function VideosList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Videos</h1>
          <p className="text-muted-foreground">Manage and explore your video summaries.</p>
        </div>
        <Link to="/videos/add" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="size-4" />
          Add Video
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search videos..." className="pl-10" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="size-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="tech">Tech</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="life">Life</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {mockVideos.map((video) => (
          <Card key={video.id} className="hover:border-primary/50 transition-colors group">
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4">
                <div className="relative aspect-video w-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  <Play className="size-8 text-muted-foreground opacity-50" />
                  <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1 rounded font-mono">
                    {video.duration}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={video.status === "Summarized" ? "default" : "secondary"}>
                      {video.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{video.category}</span>
                  </div>
                  <h3 className="font-bold truncate group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {video.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/videos/${video.id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
                    <ArrowRight className="size-4" />
                  </Link>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
