import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  DollarSign,
  User,
  FileText,
  UsersRound,
  FolderKanban,
  Menu,
  X,
} from "lucide-react";
import useUserStore from "../store/userStore";
import PERMISSIONS from "../config/permissions";

const Sidebar = () => {
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const { user } = useUserStore();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard, permission: PERMISSIONS.VIEW_ADMIN_DASHBOARD },
    { name: "Customers", path: "/customers", icon: UsersRound, permission: PERMISSIONS.VIEW_CUSTOMERS },
    { name: "Plans", path: "/plans", icon: FolderKanban, permission: PERMISSIONS.VIEW_PLANS },
    { name: "Agents", path: "/agents", icon: User, permission: PERMISSIONS.VIEW_AGENTS },
    { name: "Collection", path: "/collection", icon: DollarSign, permission: PERMISSIONS.VIEW_COLLECTION },
    { name: "Reports", path: "/reports", icon: FileText, permission: PERMISSIONS.VIEW_REPORTS },
    { name: "Payments", path: "/payments", icon: CreditCard, permission: PERMISSIONS.VIEW_PAYMENTS },
  ];

  const filteredItems = navItems.filter((item) => {
    if (!item.permission) return true;
    if (!user || !Array.isArray(user.allowedFeatures)) return false;
    return user.allowedFeatures.includes(item.permission);
  });

  // Mobile: show these three first; others go under "More"
  const primaryNames = ["Dashboard", "Customers", "Collection"];
  const mobilePrimary = filteredItems.filter((i) => primaryNames.includes(i.name));
  const mobileMore = filteredItems.filter((i) => !primaryNames.includes(i.name));

  const go = (path) => {
    setMobileMoreOpen(false);
    navigate(path);
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMobileMoreOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Desktop / Tablet Sidebar (fixed width, no toggle) */}
      <aside
        className="
          hidden md:flex relative flex-col
          bg-gray-50 text-gray-800 border-r border-gray-200
          w-64 h-[calc(100vh-4rem)]
        "
      >
        <nav className="flex flex-col mt-6 px-3 overflow-y-auto space-y-2.5">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "group relative flex items-center rounded-xl",
                    "transition-all duration-200 ease-out",
                    "px-4 py-3", // bigger touch target
                    isActive
                      ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white shadow"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                    "hover:translate-x-1 cursor-pointer",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
                  ].join(" ")
                }
              >
                <Icon size={24} className="min-w-[24px]" />
                <span className="ml-3 text-[15px] leading-tight">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Bar: primary items + More */}
      <div
        className="
          md:hidden fixed bottom-0 inset-x-0 z-40
          bg-white border-t border-gray-200
          rounded-t-xl shadow-[0_-4px_16px_rgba(0,0,0,0.12)]
        "
      >
        {/* Top row: 3 primary + More */}
        <div className="grid grid-cols-4 gap-3 px-3 py-2.5">
          {mobilePrimary.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "flex flex-col items-center justify-center rounded-lg",
                    "min-w-[76px] px-3 py-3",
                    "transition-all duration-200 ease-out",
                    isActive
                      ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white shadow"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "cursor-pointer",
                  ].join(" ")
                }
                aria-label={item.name}
                onClick={() => setMobileMoreOpen(false)}
              >
                <Icon size={24} />
                <span className="mt-1 text-[12px] leading-none">{item.name}</span>
              </NavLink>
            );
          })}

          {/* More button (matches selected gradient when open) */}
          <button
            onClick={() => setMobileMoreOpen((v) => !v)}
            className={[
              "flex flex-col items-center justify-center rounded-lg min-w-[76px] px-3 py-3",
              "transition-all duration-200 ease-out cursor-pointer",
              mobileMoreOpen
                ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white shadow"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            ].join(" ")}
            aria-expanded={mobileMoreOpen}
            aria-label={mobileMoreOpen ? "Close more options" : "Open more options"}
          >
            {mobileMoreOpen ? <X size={24} /> : <Menu size={24} />}
            <span className="mt-1 text-[12px] leading-none">
              {mobileMoreOpen ? "Close" : "More"}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div
          className={[
            "mx-3 h-px bg-gray-200 transition-opacity duration-200",
            mobileMoreOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        {/* Expanded row: remaining items (animated) */}
        <div
          className={[
            "grid grid-cols-4 gap-3 px-3 pb-3",
            "transition-[max-height,opacity] duration-200 ease-out overflow-hidden",
            mobileMoreOpen ? "max-h-64 opacity-100 pt-2" : "max-h-0 opacity-0 pt-0",
          ].join(" ")}
        >
          {mobileMore.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => go(item.path)}
                className="
                  flex flex-col items-center justify-center
                  rounded-lg px-3 py-3
                  text-gray-600 hover:bg-gray-50 hover:text-gray-900
                  transition-all duration-200 ease-out
                  cursor-pointer
                "
              >
                <Icon size={24} />
                <span className="mt-1 text-[12px] leading-none text-center">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
