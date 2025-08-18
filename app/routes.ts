import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/portfolios", "routes/portfolios.tsx"),
  route("/portfolios/:slug", "routes/portfolios.$slug.tsx"),
  route("/about", "routes/about.tsx"),
  route("/login", "routes/login.tsx"),
  route("/register", "routes/register.tsx"),
  route("/dashboard", "routes/dashboard.tsx"),
  route("/logout", "routes/logout.tsx"),
  route("/auth/google", "routes/auth.google.tsx"),
  route("/auth/google/callback", "routes/auth.google.callback.tsx")
] satisfies RouteConfig;
