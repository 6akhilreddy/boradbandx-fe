// src/components/Navbar.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { User, UserRound, ChevronDown, LogOut, Mail, Wifi, Menu } from "lucide-react";
import useUserStore from "../store/userStore";
import { logout } from "../api/authApi";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, clearUser } = useUserStore();

  const companyName = user?.company?.name || user?.companyName || "Srishti Broadband";
  const username = user?.name || "User";

  // Separate states/refs for mobile and desktop menus
  const [openMobile, setOpenMobile] = useState(false);
  const [openDesktop, setOpenDesktop] = useState(false);

  const mobileBtnRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const desktopBtnRef = useRef(null);
  const desktopMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
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

            {openMobile && (
              <div
                ref={mobileMenuRef}
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg bg-white text-gray-800 shadow-xl"
              >
                {/* Header (underlined) */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium">{username}</p>
                  {user?.email ? (
                    <p className="mt-0.5 flex items-center text-xs text-gray-500 truncate">
                      <Mail className="mr-1 h-4 w-4" />
                      {user.email}
                    </p>
                  ) : null}
                </div>

                {/* Profile (underlined, with icon, hover anim, cursor) */}
                <button
                  role="menuitem"
                  onClick={handleProfile}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm border-b border-gray-200 hover:bg-gray-50 hover:pl-5 transition-all duration-150 ease-out cursor-pointer"
                >
                  <UserRound className="h-4 w-4" />
                  Profile
                </button>

                {/* Logout (underlined, hover anim, cursor) */}
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 border-b border-gray-200 hover:bg-red-50 hover:pl-5 transition-all duration-150 ease-out cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP: BroadbandX (left), Company (center), Profile (right) */}
        <div className="hidden md:grid grid-cols-3 items-center h-16 w-full px-4">
          {/* LEFT: Brand */}
          <div className="justify-self-start pl-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 select-none"
              aria-label="Go to home"
            >
              <Wifi className="h-6 w-6 drop-shadow-sm" />
              <span className="text-2xl font-semibold tracking-tight drop-shadow-sm">
                BroadbandX
              </span>
            </button>
          </div>

          {/* CENTER: Company name */}
          <div className="justify-self-center min-w-0">
            <span className="block truncate text-lg font-semibold drop-shadow-sm">
              {companyName}
            </span>
          </div>

          {/* RIGHT: Profile */}
          <div className="justify-self-end pr-3 relative">
            <button
              ref={desktopBtnRef}
              onClick={() => setOpenDesktop((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={openDesktop}
              className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-white/10 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 transition"
            >
              <span className="h-9 w-9 grid place-items-center rounded-md bg-white/20 ring-1 ring-white/30 hover:bg-white/25">
                <User className="h-5 w-5 text-white" />
              </span>
              <span className="text-sm font-medium">{username}</span>
              <ChevronDown className="h-4 w-4 opacity-80" />
            </button>

            {/* Dropdown */}
            {openDesktop && (
              <div
                ref={desktopMenuRef}
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg bg-white text-gray-800 shadow-xl"
              >
                {/* Header (underlined) */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium">{username}</p>
                  {user?.email ? (
                    <p className="mt-0.5 flex items-center text-xs text-gray-500 truncate">
                      <Mail className="mr-1 h-4 w-4" />
                      {user.email}
                    </p>
                  ) : null}
                </div>

                {/* Profile (underlined, with icon, hover anim, cursor) */}
                <button
                  role="menuitem"
                  onClick={handleProfile}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm border-b border-gray-200 hover:bg-gray-50 hover:pl-5 transition-all duration-150 ease-out cursor-pointer"
                >
                  <UserRound className="h-4 w-4" />
                  Profile
                </button>

                {/* Logout (underlined, hover anim, cursor) */}
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 border-b border-gray-200 hover:bg-red-50 hover:pl-5 transition-all duration-150 ease-out cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
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
