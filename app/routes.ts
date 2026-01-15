import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/dev", "routes/dev.tsx"),
  route("/api/summarize", "routes/api.summarize.ts"),
] satisfies RouteConfig;
