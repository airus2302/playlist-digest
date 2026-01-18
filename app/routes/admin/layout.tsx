import { Outlet } from "react-router";
import { ShieldCheck, Users, Activity, Settings } from "lucide-react";
import { cn } from "~/lib/utils";
import { NavLink } from "react-router";

const adminNav = [
  { icon: Activity, label: "Overview", to: "/admin" },
  { icon: Users, label: "Users", to: "/admin/users" },
  { icon: Settings, label: "System Settings", to: "#" },
];

export default function AdminLayout() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-destructive">Admin Console</h1>
            <p className="text-muted-foreground">Internal management and system health.</p>
          </div>
        </div>
      </div>

      <nav className="flex gap-2 border-b pb-4">
        {adminNav.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) => cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
              isActive 
                ? "bg-destructive text-destructive-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
