import type { Route } from "./+types/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Activity, Server, Database, Globe } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Dashboard | Playlist Digest" },
  ];
}

const systems = [
  { name: "API Server", status: "Operational", icon: Server, color: "text-green-500" },
  { name: "Summarizer Worker", status: "Busy (42 items)", icon: Activity, color: "text-blue-500" },
  { name: "Database", status: "Operational", icon: Database, color: "text-green-500" },
  { name: "Redis Cache", status: "Operational", icon: Globe, color: "text-green-500" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {systems.map((system) => (
          <Card key={system.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{system.name}</CardTitle>
              <system.icon className={`size-4 ${system.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{system.status}</div>
              <p className="text-xs text-muted-foreground">Uptime: 99.9%</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>Recent events across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 font-mono text-xs">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 p-2 rounded bg-muted/50 border-l-4 border-primary">
                <span className="text-muted-foreground whitespace-nowrap">2026-01-19 14:32:0{i}</span>
                <span className="font-bold text-primary">[INFO]</span>
                <span>Worker processed video_id: {1000 + i} successfully in 12.4s</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
