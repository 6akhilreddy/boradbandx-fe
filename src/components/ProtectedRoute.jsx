import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useUserStore from "../store/userStore";
import ROUTES from "../config/routes";

const ProtectedRoute = ({ requiredPermission }) => {
  const isAuthenticated = useAuth();
  const { user } = useUserStore();

  if (isAuthenticated === null) return null;

  if (!isAuthenticated || !user) return <Navigate to={ROUTES.LOGIN} replace />;

  if (requiredPermission && !user?.allowedFeatures.includes(requiredPermission)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
