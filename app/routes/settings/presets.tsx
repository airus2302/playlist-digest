import type { Route } from "./+types/presets";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Sparkles, SlidersHorizontal } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Presets Settings | Playlist Digest" },
  ];
}

export default function PresetsSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <CardTitle>AI Summarization Presets</CardTitle>
          </div>
          <CardDescription>Configure how your video summaries are generated.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-y-2">
            <div className="space-y-0.5">
              <Label className="text-base">Focus on Actionables</Label>
              <p className="text-sm text-muted-foreground">Prioritize extracting practical steps and key takeaways.</p>
            </div>
            <Button variant="outline" size="sm" className="w-12 h-6 p-0 rounded-full relative">
                <div className="absolute right-1 size-4 bg-primary rounded-full" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label>Summary Length</Label>
            <Select defaultValue="medium">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (Bullet points only)</SelectItem>
                <SelectItem value="medium">Medium (Detailed bullets + intro)</SelectItem>
                <SelectItem value="long">Long (Comprehensive analysis)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tone of Voice</Label>
            <Select defaultValue="professional">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual & Friendly</SelectItem>
                <SelectItem value="professional">Professional & Objective</SelectItem>
                <SelectItem value="academic">Academic & Thorough</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="border-t p-6">
          <Button className="gap-2">
            <SlidersHorizontal className="size-4" />
            Save Presets
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
