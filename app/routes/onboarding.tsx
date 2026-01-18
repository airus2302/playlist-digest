import type { Route } from "./+types/onboarding";
import { Link } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Onboarding | Playlist Digest" },
  ];
}

export default function Onboarding() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Welcome to <span className="text-primary">Playlist Digest</span>
          </h1>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Let's get you set up. How many videos do you want to see in your digest today?
          </p>
        </div>
        
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle>Daily Goal</CardTitle>
            <CardDescription>
              Set your preferred number of video summaries per day. You can always change this later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="goal" className="text-lg">Target Videos</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    id="goal" 
                    type="number" 
                    defaultValue={3} 
                    className="text-2xl h-16 text-center font-bold"
                  />
                  <span className="text-xl font-medium text-muted-foreground">videos / day</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link 
              to="/dashboard" 
              className={cn(buttonVariants({ size: "lg" }), "w-full text-lg h-14 shadow-primary/20 shadow-lg")}
            >
              Start Curating
            </Link>
          </CardFooter>
        </Card>
        
        <div className="flex justify-center">
          <p className="text-sm text-muted-foreground italic">
            "The best way to consume content is with intention."
          </p>
        </div>
      </div>
    </div>
  );
}
