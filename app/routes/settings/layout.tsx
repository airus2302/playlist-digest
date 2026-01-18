import { NavLink, Outlet } from "react-router";
import { cn } from "~/lib/utils";
import { User, Bell, Shield, Sliders, Tags } from "lucide-react";

const settingsNav = [
  { icon: User, label: "Profile", to: "/settings" },
  { icon: Sliders, label: "Presets", to: "/settings/presets" },
  { icon: Tags, label: "Categories", to: "/settings/categories" },
  { icon: Bell, label: "Notifications", to: "#" },
  { icon: Shield, label: "Security", to: "#" },
];

export default function SettingsLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {settingsNav.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === "/settings"}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        
        <div className="flex-1 max-w-3xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
