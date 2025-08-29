import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import useUserStore from "../store/userStore";

const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const { user, token } = useUserStore();
  const logoutUser = useUserStore((state) => state.logout);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  useEffect(() => {
    const checkAuth = () => {
      try {
        if (token && user) {
          const decoded = jwtDecode(token);

          // Check if token is expired
          if (decoded.exp * 1000 > Date.now()) {
            // Token is valid, user is authenticated
            setLoading(false);
          } else {
            // Token expired, clear everything
            console.log("Token expired, logging out");
            logoutUser();
            setLoading(false);
          }
        } else {
          // No token or user, not authenticated
          setLoading(false);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        logoutUser();
        setLoading(false);
      }
    };

    checkAuth();
  }, [token, user, logoutUser]);

  const login = (userData, token) => {
    // This is handled by the userStore setUser method
    console.log("Login called with:", userData.roleCode);
  };

  const logout = () => {
    logoutUser();
  };

  const hasPermission = (permission) => {
    if (!user || !user.allowedFeatures) return false;
    return user.allowedFeatures.includes(permission);
  };

  const hasRole = (role) => {
    if (!user || !user.roleCode) return false;
    return user.roleCode === role;
  };

  const isSuperAdmin = () => hasRole("SUPER_ADMIN");
  const isAdmin = () => hasRole("ADMIN");
  const isAgent = () => hasRole("AGENT");

  return {
    isAuthenticated: isAuthenticated,
    user,
    loading,
    login,
    logout,
    hasPermission,
    hasRole,
    isSuperAdmin,
    isAdmin,
    isAgent,
  };
};

export default useAuth;
