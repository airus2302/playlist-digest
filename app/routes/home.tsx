import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { Button } from "~/components/ui/button";
import { auth } from "~/services/auth/index.server";

export function meta() {
  return [
    { title: "Playlist Digest - Tame Your Watch Later" },
    { name: "description", content: "AI-powered summaries to help you decide what to watch." },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await auth.getCurrentUser(request);
  return { user };
}

export default function Home() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <header className="px-6 py-4 flex items-center justify-between border-b bg-background/95 backdrop-blur">
         <h1 className="font-bold text-xl">Playlist Digest</h1>
         <nav>
           {user ? (
             <Button asChild variant="outline">
               <Link to="/dashboard">Go to Dashboard</Link>
             </Button>
           ) : (
             <Button asChild>
               <Link to="/dev/login">Sign In</Link>
             </Button>
           )}
         </nav>
      </header>

      <main className="flex-1">
        <section className="py-24 text-center space-y-8 px-4">
           <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
             Your Watch Later Playlist,<br/>
             <span className="text-primary">Finally Organized.</span>
           </h2>
           <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
             Stop hoarding videos. Get AI-powered 1-minute digests, decide if it's worth your time, 
             and reclaim your attention span.
           </p>
           <div className="flex justify-center gap-4">
             {user ? (
               <Button size="lg" asChild>
                 <Link to="/videos/add">Add First Video</Link>
               </Button>
             ) : (
               <Button size="lg" asChild>
                 <Link to="/dev/login">Get Started for Free</Link>
               </Button>
             )}
           </div>
        </section>

        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
             <div className="space-y-2">
                <h3 className="text-xl font-bold">Digest before Watching</h3>
                <p className="text-muted-foreground">Get bullet points, evidence, and a "decision hint" in seconds.</p>
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-bold">1-Click Decisions</h3>
                <p className="text-muted-foreground">Watch, Pass, or Schedule. Clear your queue with confidence.</p>
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-bold">Track Your Time</h3>
                <p className="text-muted-foreground">See how many hours you saved by skipping irrelevant content.</p>
             </div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground">
        © 2026 Playlist Digest.
      </footer>
    </div>
  );
}