import { NavLink, Outlet } from "react-router";
import { LayoutDashboard, Video, Settings, ShieldCheck, PlusCircle, List, User, LogOut } from "lucide-react";
import { cn } from "~/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: List, label: "Videos", to: "/videos" },
  { icon: PlusCircle, label: "Add Video", to: "/videos/add" },
  { icon: Settings, label: "Settings", to: "/settings" },
  { icon: ShieldCheck, label: "Admin", to: "/admin" },
];

export default function AuthLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tighter text-sidebar-foreground flex items-center gap-2">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              PD
            </div>
            Playlist Digest
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/70">
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-sidebar-foreground">John Doe</p>
              <p className="text-xs truncate">john@example.com</p>
            </div>
          </div>
          <NavLink
            to="/login"
            className="flex items-center gap-3 px-3 py-2 mt-2 rounded-lg transition-colors text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <LogOut className="size-4" />
            Logout
          </NavLink>
        </div>
      </aside>
      
      <main className="flex-1 overflow-y-auto bg-muted/5">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
