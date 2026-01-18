import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/onboarding", "routes/onboarding.tsx"),
  
  layout("routes/auth-layout.tsx", [
    route("/dashboard", "routes/dashboard.tsx"),
    route("/videos", "routes/videos/list.tsx"),
    route("/videos/add", "routes/videos/add.tsx"),
    route("/videos/:id", "routes/videos/detail.tsx"),
    route("/videos/:id/transcript", "routes/videos/transcript.tsx"),
    
    layout("routes/settings/layout.tsx", [
      route("/settings", "routes/settings/index.tsx"),
      route("/settings/presets", "routes/settings/presets.tsx"),
      route("/settings/categories", "routes/settings/categories.tsx"),
    ]),
    
    layout("routes/admin/layout.tsx", [
      route("/admin", "routes/admin/dashboard.tsx"),
      route("/admin/users", "routes/admin/users.tsx"),
      route("/admin/users/:id", "routes/admin/user-detail.tsx"),
    ]),
  ]),

  route("/dev", "routes/dev.tsx"),
  route("/api/summarize", "routes/api.summarize.ts"),
] satisfies RouteConfig;
