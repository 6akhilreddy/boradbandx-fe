// src/components/Navbar.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { User, UserRound, ChevronDown, LogOut, Mail, Wifi, Menu } from "lucide-react";
import useUserStore from "../store/userStore";
import { logout } from "../api/authApi";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const clearUser = useUserStore((state) => state.clearUser);
  const logoutUser = useUserStore((state) => state.logout);

  const companyName = user?.company?.name || user?.companyName || "BroadbandX";
  const username = user?.name || "User";
  const userRole = user?.roleCode || "User";

  // Separate states/refs for mobile and desktop menus
  const [openMobile, setOpenMobile] = useState(false);
  const [openDesktop, setOpenDesktop] = useState(false);

  const mobileBtnRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const desktopBtnRef = useRef(null);
  const desktopMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    logoutUser();
    clearUser();
    navigate("/login", { replace: true });
  };

  const handleProfile = () => {
    setOpenMobile(false);
    setOpenDesktop(false);
    navigate("/profile");
  };

  // Close on outside click (both menus)
  useEffect(() => {
    const onClick = (e) => {
      if (
        openMobile &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        mobileBtnRef.current &&
        !mobileBtnRef.current.contains(e.target)
      ) {
        setOpenMobile(false);
      }
      if (
        openDesktop &&
        desktopMenuRef.current &&
        !desktopMenuRef.current.contains(e.target) &&
        desktopBtnRef.current &&
        !desktopBtnRef.current.contains(e.target)
      ) {
        setOpenDesktop(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openMobile, openDesktop]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpenMobile(false);
        setOpenDesktop(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm">
      <nav className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white">
        {/* MOBILE: wifi + company (left), hamburger (right) */}
        <div className="flex md:hidden items-center justify-between h-16 w-full px-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 select-none"
            aria-label="Go to home"
          >
            <Wifi className="h-5 w-5 drop-shadow-sm" />
            <span className="text-sm font-medium truncate drop-shadow-sm">
              {companyName}
            </span>
          </button>

          <div className="relative">
            <button
              ref={mobileBtnRef}
              onClick={() => setOpenMobile((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={openMobile}
              aria-label="Open menu"
              className="grid h-9 w-9 place-items-center rounded-md bg-white/15 hover:bg-white/20 active:scale-95 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile dropdown */}
            {openMobile && (
              <div
                ref={mobileMenuRef}
                className="absolute right-0 top-full mt-1 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black/5 py-1"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{username}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {userRole.toLowerCase().replace('_', ' ')}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  )}
                </div>

                {/* Menu items */}
                <button
                  onClick={handleProfile}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP: company (left), user menu (right) */}
        <div className="hidden md:flex items-center justify-between h-16 w-full px-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 select-none"
            aria-label="Go to home"
          >
            <Wifi className="h-6 w-6 drop-shadow-sm" />
            <span className="text-lg font-semibold drop-shadow-sm">
              {companyName}
            </span>
          </button>

          <div className="relative">
            <button
              ref={desktopBtnRef}
              onClick={() => setOpenDesktop((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={openDesktop}
              className="flex items-center gap-3 rounded-lg px-3 py-2 bg-white/15 hover:bg-white/20 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <UserRound className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{username}</p>
                  <p className="text-xs opacity-90 capitalize">
                    {userRole.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            </button>

            {/* Desktop dropdown */}
            {openDesktop && (
              <div
                ref={desktopMenuRef}
                className="absolute right-0 top-full mt-1 w-64 rounded-lg bg-white shadow-lg ring-1 ring-black/5 py-1"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{username}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {userRole.toLowerCase().replace('_', ' ')}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  )}
                  {user?.companyId && (
                    <p className="text-xs text-gray-500">Company ID: {user.companyId}</p>
                  )}
                </div>

                {/* Menu items */}
                <button
                  onClick={handleProfile}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
