import { Loader2 } from "lucide-react";
import { type ActionFunctionArgs, Form, redirect, useActionData, useNavigation } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { auth } from "~/services/auth/index.server";
import { addVideo } from "~/services/video.server";

export async function loader({ request }: { request: Request }) {
  await auth.requireUser(request);
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await auth.requireUser(request);
  const formData = await request.formData();
  const url = formData.get("url") as string;

  if (!url) {
    return { error: "URL is required" };
  }

  try {
    await addVideo(user.id, url);
    return redirect("/videos");
  } catch (e: any) {
    return { error: e.message || "Failed to add video" };
  }
}

export default function AddVideo() {
  const navigation = useNavigation();
  const actionData = useActionData<{ error?: string }>();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add YouTube Video</CardTitle>
          <CardDescription>Enter a YouTube URL to start the digest process.</CardDescription>
        </CardHeader>
        <CardContent>
          {actionData?.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{actionData.error}</AlertDescription>
            </Alert>
          )}
          
          <Form method="post" className="space-y-4">
            <div className="flex gap-2">
              <Input 
                name="url" 
                placeholder="https://www.youtube.com/watch?v=..." 
                required 
                className="flex-1"
              />
            </div>
            <div className="flex justify-end">
               <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Video
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
