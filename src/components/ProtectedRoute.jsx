import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useUserStore from "../store/userStore";
import ROUTES from "../config/routes";
import Spinner from "./Spinner";
import { validateAndHandleToken } from "../utils/tokenUtils";

const ProtectedRoute = ({ 
  children, 
  requiredPermission = null, 
  requiredRole = null,
  fallbackRoute = ROUTES.UNAUTHORIZED 
}) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const user = useUserStore((state) => state.user);
  const token = useUserStore((state) => state.token);
  const hasPermission = useUserStore((state) => state.hasPermission);
  const hasRole = useUserStore((state) => state.hasRole);
  const location = useLocation();

  // Wait for Zustand persist to rehydrate from localStorage
  useEffect(() => {
    // Zustand persist rehydrates synchronously on first render
    // But we need to wait a tick to ensure it's complete
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Check authentication - we have user and token
  const isAuthenticated = !!(user && token);
  
  // Show loading while waiting for hydration
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner loadingTxt="Loading..." size="medium" />
      </div>
    );
  }
  
  // Validate token if we have one (this will handle expiration)
  if (isAuthenticated) {
    const tokenValid = validateAndHandleToken();
    // If token is invalid, validateAndHandleToken will redirect, so we return early
    if (!tokenValid) {
      return null; // Will redirect via validateAndHandleToken
    }
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // If user data is not loaded yet, show loading
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner loadingTxt="Loading..." size="medium" />
      </div>
    );
  }

  // Check if user has required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={fallbackRoute} replace />;
  }

  // Check if user has required role
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={fallbackRoute} replace />;
  }

  return children;
};

// Convenience components for common role checks
export const SuperAdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" fallbackRoute={ROUTES.UNAUTHORIZED}>
      {children}
    </ProtectedRoute>
  );
};

export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="ADMIN" fallbackRoute={ROUTES.UNAUTHORIZED}>
      {children}
    </ProtectedRoute>
  );
};

export const AgentRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="AGENT" fallbackRoute={ROUTES.UNAUTHORIZED}>
      {children}
    </ProtectedRoute>
  );
};

// Permission-based route components
export const CustomerManageRoute = ({ children }) => (
  <ProtectedRoute requiredPermission="customer.add" fallbackRoute={ROUTES.UNAUTHORIZED}>
    {children}
  </ProtectedRoute>
);

export const CustomerViewRoute = ({ children }) => (
  <ProtectedRoute requiredPermission="customers.view" fallbackRoute={ROUTES.UNAUTHORIZED}>
    {children}
  </ProtectedRoute>
);

export const PlanManageRoute = ({ children }) => (
  <ProtectedRoute requiredPermission="plan.manage" fallbackRoute={ROUTES.UNAUTHORIZED}>
    {children}
  </ProtectedRoute>
);

export const AgentManageRoute = ({ children }) => (
  <ProtectedRoute requiredPermission="agent.manage" fallbackRoute={ROUTES.UNAUTHORIZED}>
    {children}
  </ProtectedRoute>
);

export const CompanyManageRoute = ({ children }) => (
  <ProtectedRoute requiredPermission="company.manage" fallbackRoute={ROUTES.UNAUTHORIZED}>
    {children}
  </ProtectedRoute>
);

// Complaints route - allows ADMIN/SUPER_ADMIN or complaints.view permission
export const ComplaintsRoute = ({ children }) => {
  const user = useUserStore((state) => state.user);
  const token = useUserStore((state) => state.token);
  const hasPermission = useUserStore((state) => state.hasPermission);
  const hasRole = useUserStore((state) => state.hasRole);
  const location = useLocation();

  // Check authentication - we have user and token
  const isAuthenticated = !!(user && token);
  
  // Validate token if we have one (this will handle expiration)
  if (isAuthenticated) {
    const tokenValid = validateAndHandleToken();
    // If token is invalid, validateAndHandleToken will redirect, so we return early
    if (!tokenValid) {
      return null; // Will redirect via validateAndHandleToken
    }
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // If user data is not loaded yet, show loading
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner loadingTxt="Loading..." size="medium" />
      </div>
    );
  }

  // Allow if user has permission OR is ADMIN/SUPER_ADMIN
  const hasAccess = 
    hasPermission("complaints.view") || 
    hasPermission("complaint.add") ||
    hasRole("ADMIN") || 
    hasRole("SUPER_ADMIN");

  if (!hasAccess) {
    console.warn("Access denied: User lacks complaints access");
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children;
};

export default ProtectedRoute;
