// Determine backend API URL dynamically:
// 1. Explicit environment override via VITE_API_URL if defined
// 2. If running on deployed environments (broadbandx.vercel.app or non-localhost) or production build -> use remote backend
// 3. Otherwise (local dev on localhost/127.0.0.1) -> use http://localhost:3000/api
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0");

export const BASE_URL =
  import.meta.env?.VITE_API_URL ||
  (!isLocalhost || import.meta.env?.PROD
    ? "https://broadbandx-be.vercel.app/api"
    : "http://localhost:3000/api");
export const URLS = {
  AUTH: "/auth",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  COMPANIES: "/companies",
  ADMINS_COMPANY: "/admins/company",
  ADMINS: "/admins",
  AGENTS: "/agents",
  SUPERVISORS: "/supervisors",
  CUSTOMERS: "/customers",
  AREAS: "/areas",
  SERVICES: "/services",
  PLANS: "/plans",
  ORDERS: "/orders",
  BILLING: "/billing",
  REPORTS: "/reports",
  SETTINGS: "/settings",
  NOTIFICATIONS: "/notifications",
  DASHBOARD_STATS: "/dashboard/stats",
  PAYMENTS: "/payments",
  DASHBOARD: "/dashboard",
  COMPLAINTS: "/complaints",
  INVENTORY: "/inventory",
};
