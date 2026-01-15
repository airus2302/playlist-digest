import { LayoutDashboard, LogOut, Video } from "lucide-react";
import { Link, type LoaderFunctionArgs, Outlet, redirect, useLoaderData, useSubmit } from "react-router";
import { Button } from "~/components/ui/button";
import { auth } from "~/services/auth/index.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await auth.requireUser(request);
  return { user };
}

export default function AppLayout() {
  const { user } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link to="/" className="mr-6 flex items-center space-x-2 font-bold text-xl">
              Playlist Digest
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link to="/videos" className="transition-colors hover:text-foreground/80 text-foreground/60 hover:text-foreground">
                Videos
              </Link>
              <Link to="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60 hover:text-foreground">
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Search or other items */}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">{user.email}</span>
              <Button variant="ghost" size="icon" onClick={() => submit(null, { method: "post", action: "/logout" })}>
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6">
        <Outlet />
      </main>
      
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
           <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
             Built by Antigravity.
           </p>
        </div>
      </footer>
    </div>
  );
}
