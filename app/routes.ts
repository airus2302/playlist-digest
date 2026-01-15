import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  // Public
  index("routes/home.tsx"),
  route("dev/login", "routes/dev.login.tsx"),
  route("logout", "routes/logout.tsx"),
  
  // Protected flow
  route("onboarding", "routes/onboarding.tsx"),

  // App Layout
  layout("routes/layout.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("videos", "routes/videos._index.tsx"),
    route("videos/add", "routes/videos.add.tsx"),
    route("videos/:id/transcript", "routes/videos.$id.transcript.tsx"),
    route("videos/:id", "routes/videos.$id.tsx"),
  ]),
] satisfies RouteConfig;
