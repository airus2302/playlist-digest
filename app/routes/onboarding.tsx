import { eq } from "drizzle-orm";
import { type ActionFunctionArgs, Form, redirect } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { db } from "~/db";
import { users } from "~/db/schema";
import { auth } from "~/services/auth/index.server";

// Check if user already finished onboarding
export async function loader({ request }: { request: Request }) {
  const user = await auth.requireUser(request);
  // Ideally keep an 'onboardingCompleted' flag in user table. 
  // For MVP, we just show this page.
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await auth.requireUser(request);
  // In a real app we save preferences here.
  // For MVP, just redirect to /videos/add to prompt adding video.
  return redirect("/videos/add");
}

export default function Onboarding() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome to Playlist Digest</CardTitle>
          <CardDescription>
            Let's get your playlist under control. How many items are in your "Watch Later" list?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="count">Approximate Video Count</Label>
              <Input 
                id="count" 
                name="count" 
                type="number" 
                placeholder="e.g. 150" 
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal">Your Goal</Label>
              <div className="grid grid-cols-1 gap-2 text-sm">
                 <div className="flex items-center gap-2 border p-3 rounded-md hover:bg-muted cursor-pointer">
                    <input type="radio" name="goal" id="g1" value="clean" defaultChecked />
                    <label htmlFor="g1" className="cursor-pointer flex-1">Reach Zero (Clean Slate)</label>
                 </div>
                 <div className="flex items-center gap-2 border p-3 rounded-md hover:bg-muted cursor-pointer">
                    <input type="radio" name="goal" id="g2" value="pick" />
                    <label htmlFor="g2" className="cursor-pointer flex-1">Pick the Best 10%</label>
                 </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Start Digiesting
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
