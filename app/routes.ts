import { type RouteConfig, route, index, layout } from "@react-router/dev/routes";

export default [
  // BACKEND API (React Router resource route -> SQLite + mocked chain)
  route("api/*", "routes/api.ts"),

  // PUBLIC ROUTES (with PublicLayout)
  layout("routes/_public.tsx", [
    index("routes/_public._index.tsx"),
    route("explore", "routes/_public.explore.tsx"),
    route("asset/:id", "routes/_public.asset.$id.tsx"),
    route("category/real-estate", "routes/_public.category.real-estate.tsx"),
    route("category/commodities", "routes/_public.category.commodities.tsx"),
    route("category/infrastructure", "routes/_public.category.infrastructure.tsx"),
    route("how-it-works", "routes/_public.how-it-works.tsx"),
    route("login", "routes/_public.login.tsx"),
  ]),

  // INVESTOR ROUTES (with InvestorLayout)
  layout("routes/_investor.tsx", [
    route("investor/dashboard", "routes/_investor.investor.dashboard.tsx"),
    route("investor/investments", "routes/_investor.investor.investments.tsx"),
    route("investor/portfolio", "routes/_investor.investor.portfolio.tsx"),
    route("investor/transactions", "routes/_investor.investor.transactions.tsx"),
    route("investor/watchlist", "routes/_investor.investor.watchlist.tsx"),
    route("investor/settings", "routes/_investor.investor.settings.tsx"),
  ]),

  // ISSUER ROUTES (with IssuerLayout)
  layout("routes/_issuer.tsx", [
    route("issuer/dashboard", "routes/_issuer.issuer.dashboard.tsx"),
    route("issuer/tokenize", "routes/_issuer.issuer.tokenize.tsx"),
    route("issuer/assets", "routes/_issuer.issuer.assets.tsx"),
    route("issuer/status", "routes/_issuer.issuer.status.tsx"),
  ]),

  // ADMIN ROUTES (with AdminLayout)
  layout("routes/_admin.tsx", [
    route("admin/dashboard", "routes/_admin.admin.dashboard.tsx"),
    route("admin/verification", "routes/_admin.admin.verification.tsx"),
    route("admin/users", "routes/_admin.admin.users.tsx"),
    route("admin/marketplace", "routes/_admin.admin.marketplace.tsx"),
  ]),

  // CATCH-ALL 404 ROUTE
  route("*", "routes/404.tsx"),
] satisfies RouteConfig;
