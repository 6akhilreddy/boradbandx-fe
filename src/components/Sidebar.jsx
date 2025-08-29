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
  Building,
} from "lucide-react";
import useUserStore from "../store/userStore";
import routes from "../config/routes";

const Sidebar = () => {
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const { user } = useUserStore();
  const hasPermission = useUserStore((state) => state.hasPermission);
  const isSuperAdmin = useUserStore((state) => state.isSuperAdmin);
  const isAdmin = useUserStore((state) => state.isAdmin);
  const isAgent = useUserStore((state) => state.isAgent);
  const navigate = useNavigate();

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    if (isSuperAdmin()) return routes.SUPER_ADMIN_DASHBOARD;
    if (isAgent()) return routes.AGENT_DASHBOARD;
    return routes.ADMIN_DASHBOARD;
  };

  const navItems = [
    // Dashboard - different for each role
    { 
      name: "Dashboard", 
      path: getDashboardRoute(), 
      icon: LayoutDashboard, 
      show: true 
    },
    
    // Customer management
    { 
      name: "Customers", 
      path: "/customers", 
      icon: UsersRound, 
      show: hasPermission("customers.view") || hasPermission("customer.view.one") 
    },
    
    // Plan management (Admin and Super Admin only)
    { 
      name: "Plans", 
      path: "/plans", 
      icon: FolderKanban, 
      show: hasPermission("plans.view") || hasPermission("plan.manage") 
    },
    
    // Agent management (Super Admin only)
    { 
      name: "Agents", 
      path: "/agents", 
      icon: User, 
      show: hasPermission("agents.view") || hasPermission("agent.manage") 
    },
    
    // Company management (Super Admin only)
    { 
      name: "Companies", 
      path: "/companies", 
      icon: Building, 
      show: hasPermission("company.manage") 
    },
    
    // Collection (Agents and Admins)
    { 
      name: "Collection", 
      path: "/collection", 
      icon: DollarSign, 
      show: hasPermission("collection.view") || hasPermission("collection.manage") 
    },
    
    // Reports (Admin and Super Admin)
    { 
      name: "Reports", 
      path: "/reports", 
      icon: FileText, 
      show: hasPermission("reports.view") 
    },
    
    // Payments (Admin and Super Admin)
    { 
      name: "Payments", 
      path: "/payments", 
      icon: CreditCard, 
      show: hasPermission("payments.view") 
    },
  ];

  const filteredItems = navItems.filter((item) => item.show);

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
        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.roleCode?.toLowerCase().replace('_', ' ')}</p>
            </div>
          </div>
        </div>

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
        <div className="flex items-center justify-around px-2 py-2">
          {mobilePrimary.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "flex flex-col items-center p-2 rounded-lg",
                    "transition-all duration-200",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                  ].join(" ")
                }
                onClick={() => go(item.path)}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{item.name}</span>
              </NavLink>
            );
          })}

          {/* More button */}
          {mobileMore.length > 0 && (
            <button
              onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
              className={[
                "flex flex-col items-center p-2 rounded-lg",
                "transition-all duration-200",
                mobileMoreOpen
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
              ].join(" ")}
            >
              {mobileMoreOpen ? <X size={20} /> : <Menu size={20} />}
              <span className="text-xs mt-1">More</span>
            </button>
          )}
        </div>

        {/* Bottom row: More items */}
        {mobileMoreOpen && mobileMore.length > 0 && (
          <div className="border-t border-gray-100 px-2 py-2">
            <div className="grid grid-cols-3 gap-1">
              {mobileMore.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      [
                        "flex flex-col items-center p-2 rounded-lg",
                        "transition-all duration-200",
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                      ].join(" ")
                    }
                    onClick={() => go(item.path)}
                  >
                    <Icon size={18} />
                    <span className="text-xs mt-1">{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
