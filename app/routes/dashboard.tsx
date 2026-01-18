import type { Route } from "./+types/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Video, CheckCircle2, Clock, Zap, ArrowRight } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard | Playlist Digest" },
  ];
}

const stats = [
  { label: "Total Videos", value: "128", icon: Video, color: "text-blue-500" },
  { label: "Processed", value: "94", icon: CheckCircle2, color: "text-green-500" },
  { label: "Pending", value: "34", icon: Clock, color: "text-yellow-500" },
  { label: "Quick Wins", value: "12", icon: Zap, color: "text-purple-500" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your playlist today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`size-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">+4 since yesterday</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4 border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Today's Decision</CardTitle>
            <CardDescription>We've analyzed your latest videos. What would you like to do?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4 items-start p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Video className="size-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">The Future of AI Agents in 2026</h3>
                  <Badge variant="secondary">Highly Relevant</Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  A deep dive into how agentic workflows are changing software development. Perfect for your "Coding" category.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm">Watch Summary</Button>
                  <Button size="sm" variant="outline">Save to Watch Later</Button>
                  <Button size="sm" variant="ghost" className="text-destructive">Dismiss</Button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-xl bg-muted/50 border border-border">
              <div className="size-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                <Video className="size-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">Next.js 16 Preview: What's New?</h3>
                  <Badge variant="outline">Updates</Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  Exploring the upcoming features in Next.js. Might be worth a quick look.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm">Watch Summary</Button>
                  <Button size="sm" variant="outline">Archive</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="size-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Summarized "React Server Components Deep Dive"</p>
                    <p className="text-xs text-muted-foreground">{i * 2} hours ago</p>
                  </div>
                  <Button variant="ghost" size="icon-sm">
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
