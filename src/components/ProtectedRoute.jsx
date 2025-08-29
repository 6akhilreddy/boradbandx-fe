import { Navigate, useLocation } from "react-router-dom";
import useUserStore from "../store/userStore";
import ROUTES from "../config/routes";
import Spinner from "./Spinner";

const ProtectedRoute = ({ 
  children, 
  requiredPermission = null, 
  requiredRole = null,
  fallbackRoute = ROUTES.UNAUTHORIZED 
}) => {
  const { user } = useUserStore();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const hasPermission = useUserStore((state) => state.hasPermission);
  const hasRole = useUserStore((state) => state.hasRole);
  const location = useLocation();

  console.log("ProtectedRoute check:", {
    isAuthenticated: isAuthenticated(),
    user: user?.roleCode,
    requiredPermission,
    requiredRole,
    location: location.pathname
  });

  // If user is not authenticated, redirect to login
  if (!isAuthenticated()) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // If user data is not loaded yet, show loading
  if (!user) {
    console.log("User data not loaded, showing loading");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  // Check if user has required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.warn(`Access denied: User lacks permission '${requiredPermission}'`);
    return <Navigate to={fallbackRoute} replace />;
  }

  // Check if user has required role
  if (requiredRole && !hasRole(requiredRole)) {
    console.warn(`Access denied: User lacks role '${requiredRole}'`);
    return <Navigate to={fallbackRoute} replace />;
  }

  console.log("Access granted, rendering children");
  return children;
};

// Convenience components for common role checks
export const SuperAdminRoute = ({ children }) => {
  console.log("SuperAdminRoute check");
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN" fallbackRoute={ROUTES.UNAUTHORIZED}>
      {children}
    </ProtectedRoute>
  );
};

export const AdminRoute = ({ children }) => {
  console.log("AdminRoute check");
  return (
    <ProtectedRoute requiredRole="ADMIN" fallbackRoute={ROUTES.UNAUTHORIZED}>
      {children}
    </ProtectedRoute>
  );
};

export const AgentRoute = ({ children }) => {
  console.log("AgentRoute check");
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

export default ProtectedRoute;
