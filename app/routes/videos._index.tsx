import { formatDistanceToNow } from "date-fns";
import { Plus } from "lucide-react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { auth } from "~/services/auth/index.server";
import { getUserVideos } from "~/services/video.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await auth.requireUser(request);
  const videos = await getUserVideos(user.id);
  return { videos };
}

export default function VideosIndex() {
  const { videos } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Videos</h1>
        <Button asChild>
          <Link to="/videos/add">
            <Plus className="mr-2 h-4 w-4" /> Add Video
          </Link>
        </Button>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No videos yet. Add one to get started!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video.id} className="flex flex-col">
              <img 
                src={video.thumbnailUrl || ""} 
                alt={video.title} 
                className="w-full h-48 object-cover rounded-t-lg bg-gray-200"
              />
              <CardHeader className="p-4">
                <CardTitle className="text-lg line-clamp-2 leading-tight">
                  <Link to={`/videos/${video.id}`} className="hover:underline">
                    {video.title}
                  </Link>
                </CardTitle>
                <div className="text-sm text-gray-500">{video.channelTitle}</div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={
                    video.status === "READY" ? "default" : 
                    video.status === "FAILED" ? "destructive" : 
                    "secondary"
                  }>
                    {video.status}
                  </Badge>
                  {video.createdAt && (
                    <span className="text-xs text-gray-400 self-center">
                      Added {formatDistanceToNow(new Date(video.createdAt))} ago
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="w-full grid grid-cols-2 gap-2">
                   {video.status === "PENDING" && (
                     <Button asChild variant="secondary" className="w-full col-span-2">
                        <Link to={`/videos/${video.id}/transcript`}>+ Add Transcript</Link>
                     </Button>
                   )}
                   {video.status === "READY" && (
                     <Button asChild className="w-full col-span-2">
                        <Link to={`/videos/${video.id}`}>View Digest</Link>
                     </Button>
                   )}
                   {video.status === "FAILED" && (
                     <Button asChild variant="destructive" className="w-full col-span-2">
                        <Link to={`/videos/${video.id}`}>View Error / Retry</Link>
                     </Button>
                   )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
