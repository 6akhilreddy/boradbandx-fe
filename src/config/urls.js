export const BASE_URL =
  typeof process !== "undefined" &&
  process.env &&
  process.env.ENVIRONMENT === "dev"
    ? "https://broadbandx-be.vercel.app/api"
    : "http://localhost:3000/api";
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
};
