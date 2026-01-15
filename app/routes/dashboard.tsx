import { eq, sql } from "drizzle-orm";
import { Activity, CheckCircle, Clock } from "lucide-react";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { db } from "~/db";
import { videos } from "~/db/schema";
import { auth } from "~/services/auth/index.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await auth.requireUser(request);

  const userVideos = await db.query.videos.findMany({
      where: eq(videos.userId, user.id),
  });

  const total = userVideos.length;
  const ready = userVideos.filter(v => v.status === "READY").length;
  const decided = userVideos.filter(v => v.status.startsWith("DECIDED")).length;
  const pending = userVideos.filter(v => v.status === "PENDING").length;

  // KPI 1: Decision Rate
  // Denom: Ready + Decided (Items that COULD have been decided)
  const decidable = ready + decided;
  const decisionRate = decidable > 0 ? Math.round((decided / decidable) * 100) : 0;

  // KPI 2: Burn down (just counts for now)
  
  // KPI 3: Time Reclaimed
  // Sum(Duration - 60s) for decided videos. 
  // If duration is null/0, assume 0 gain.
  // Formula: (Total Duration of Decided Videos) - (Decided Count * 60s)
  let savedSeconds = 0;
  userVideos.forEach(v => {
      if (v.status.startsWith("DECIDED") && v.duration) {
          // Reclaimed = Duration - 1 minute (reading summary)
          const gain = v.duration - 60;
          if (gain > 0) savedSeconds += gain;
      }
  });
  const savedMinutes = Math.round(savedSeconds / 60);

  return { 
    metrics: {
      total,
      pending,
      decisionRate,
      savedMinutes,
      decided
    }
  };
}

export default function Dashboard() {
  const { metrics } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decision Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.decisionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.decided} decided out of {metrics.decided + metrics.pending} processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Reclaimed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{metrics.savedMinutes} min</div>
             <p className="text-xs text-muted-foreground">
               Time saved by reading digests instead of watching
             </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Pipeline</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">
               {metrics.pending} pending, {metrics.decided} done
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your automated digest pipeline status.</CardDescription>
          </CardHeader>
          <CardContent>
              {/* Chart stub or list */}
              <div className="h-[200px] flex items-center justify-center border-dashed border-2 rounded-lg">
                  <span className="text-gray-400">Activity Chart Placeholder</span>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
