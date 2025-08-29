import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute, { 
  SuperAdminRoute, 
  AdminRoute, 
  AgentRoute,
  CustomerViewRoute,
  CustomerManageRoute,
  PlanManageRoute,
  AgentManageRoute,
  CompanyManageRoute
} from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import routes from "./config/routes";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import CustomerEdit from "./pages/CustomerEdit";
import Plans from "./pages/Plans";
import Agents from "./pages/Agents";
import useUserStore from "./store/userStore";

// Default redirect component
const DefaultRedirect = () => {
  const { user } = useUserStore();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated()) {
    return <Navigate to={routes.LOGIN} replace />;
  }
  
  return (
    <Navigate
      to={
        user?.roleCode === "SUPER_ADMIN"
          ? routes.SUPER_ADMIN_DASHBOARD
          : user?.roleCode === "AGENT"
          ? routes.AGENT_DASHBOARD
          : routes.ADMIN_DASHBOARD
      }
      replace
    />
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes - no authentication required */}
        <Route path={routes.LOGIN} element={<Login />} />
        <Route path={routes.UNAUTHORIZED} element={<Unauthorized />} />

        {/* Super Admin Routes */}
        <Route
          path={routes.SUPER_ADMIN_DASHBOARD}
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard />
            </SuperAdminRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path={routes.ADMIN_DASHBOARD}
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Agent Routes */}
        <Route
          path={routes.AGENT_DASHBOARD}
          element={
            <AgentRoute>
              <AdminDashboard />
            </AgentRoute>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/customers"
          element={
            <CustomerViewRoute>
              <Customers />
            </CustomerViewRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute requiredPermission="customer.view.one">
              <CustomerDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id/edit"
          element={
            <CustomerManageRoute>
              <CustomerEdit />
            </CustomerManageRoute>
          }
        />

        {/* Plan Routes */}
        <Route
          path="/plans"
          element={
            <PlanManageRoute>
              <Plans />
            </PlanManageRoute>
          }
        />
        <Route
          path="/plans/:id"
          element={
            <PlanManageRoute>
              <Plans />
            </PlanManageRoute>
          }
        />
        <Route
          path="/plans/:id/edit"
          element={
            <PlanManageRoute>
              <Plans />
            </PlanManageRoute>
          }
        />

        {/* Agent Management Routes (Super Admin Only) */}
        <Route
          path="/agents"
          element={
            <AgentManageRoute>
              <Agents />
            </AgentManageRoute>
          }
        />
        <Route
          path="/agents/:id"
          element={
            <AgentManageRoute>
              <Agents />
            </AgentManageRoute>
          }
        />
        <Route
          path="/agents/:id/edit"
          element={
            <AgentManageRoute>
              <Agents />
            </AgentManageRoute>
          }
        />

        {/* Default redirect based on user role */}
        <Route path="/" element={<DefaultRedirect />} />

        {/* Catch all route */}
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;
