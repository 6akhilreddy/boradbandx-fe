import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import useUserStore from "../store/userStore";
import { validateAndHandleToken } from "../utils/tokenUtils";

const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const { user, token } = useUserStore();
  const logoutUser = useUserStore((state) => state.logout);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  useEffect(() => {
    const checkAuth = () => {
      try {
        if (token && user) {
          // Use the utility function to validate token
          if (validateAndHandleToken()) {
            // Token is valid, user is authenticated
            setLoading(false);
          } else {
            // Token is invalid/expired, utility function handles logout and redirect
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
