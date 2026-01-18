import type { Route } from "./+types/categories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tags, Plus, X, Pencil } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Categories Settings | Playlist Digest" },
  ];
}

const initialCategories = ["Tech", "Design", "Life", "Productivity", "AI", "Cooking"];

export default function CategoriesSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Tags className="size-5 text-primary" />
            <CardTitle>Categories</CardTitle>
          </div>
          <CardDescription>Manage tags and categories to organize your video summaries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Input placeholder="New category name..." className="flex-1" />
            <Button className="gap-2">
              <Plus className="size-4" />
              Add
            </Button>
          </div>
          
          <div className="grid gap-2">
            {initialCategories.map((category) => (
              <div key={category} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-primary" />
                  <span className="font-medium">{category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm">
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="text-destructive hover:bg-destructive/10">
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-dashed p-8 text-center bg-muted/20">
        <p className="text-sm text-muted-foreground">Categories help the AI better understand the context of your videos.</p>
      </div>
    </div>
  );
}
