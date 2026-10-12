import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute, { 
  SuperAdminRoute, 
  AdminRoute, 
  AgentRoute,
  CustomerViewRoute,
  CustomerManageRoute,
  PlanManageRoute,
  AgentManageRoute,
  AgentsViewRoute,
  SupervisorsManageRoute,
  SupervisorRoute,
  CompanyManageRoute,
  ComplaintsRoute,
  InventoryRoute,
} from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import routes from "./config/routes";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Customers from "./pages/Customers";
import CustomerAdd from "./pages/CustomerAdd";
import CustomerDetail from "./pages/CustomerDetail";
import CustomerEdit from "./pages/CustomerEdit";
import Plans from "./pages/Plans";
import Agents from "./pages/Agents";
import Supervisors from "./pages/Supervisors";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import AgentDetail from "./pages/AgentDetail";
import Collection from "./pages/Collection";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Complaints from "./pages/Complaints";
import Inventory from "./pages/Inventory";
import useUserStore from "./store/userStore";
import useTokenValidation from "./hooks/useTokenValidation";

// Default redirect component
const DefaultRedirect = () => {
  const user = useUserStore((state) => state.user);
  const token = useUserStore((state) => state.token);
  
  // Check authentication directly
  const isAuthenticated = !!(user && token);
  
  if (!isAuthenticated) {
    return <Navigate to={routes.LOGIN} replace />;
  }
  
  return (
    <Navigate
      to={
        user?.roleCode === "SUPER_ADMIN"
          ? routes.SUPER_ADMIN_DASHBOARD
          : user?.roleCode === "AGENT"
          ? routes.AGENT_DASHBOARD
          : user?.roleCode === "SUPERVISOR"
          ? routes.SUPERVISOR_DASHBOARD
          : routes.ADMIN_DASHBOARD
      }
      replace
    />
  );
};

function App() {
  // Set up token validation for the entire app
  useTokenValidation();

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
        <Route
          path={routes.COMPANIES}
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
              <AgentDashboard />
            </AgentRoute>
          }
        />

        {/* Supervisor Routes */}
        <Route
          path={routes.SUPERVISOR_DASHBOARD}
          element={
            <SupervisorRoute>
              <SupervisorDashboard />
            </SupervisorRoute>
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
          path="/customers/add"
          element={
            <CustomerManageRoute>
              <CustomerAdd />
            </CustomerManageRoute>
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

        {/* Agent list/detail — admin (manage) or supervisor (view team) */}
        <Route
          path="/agents"
          element={
            <AgentsViewRoute>
              <Agents />
            </AgentsViewRoute>
          }
        />
        <Route
          path="/agents/:id"
          element={
            <AgentsViewRoute>
              <AgentDetail />
            </AgentsViewRoute>
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

        {/* Supervisor management (admin) */}
        <Route
          path="/supervisors"
          element={
            <SupervisorsManageRoute>
              <Supervisors />
            </SupervisorsManageRoute>
          }
        />

        {/* Collection Routes */}
        <Route
          path="/collection"
          element={
            <ProtectedRoute requiredPermission="collection.view">
              <Collection />
            </ProtectedRoute>
          }
        />

        {/* Payments Routes */}
        <Route
          path="/payments"
          element={
            <ProtectedRoute requiredPermission="payments.view">
              <Payments />
            </ProtectedRoute>
          }
        />

        {/* Reports Routes */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredPermission="reports.view">
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Complaints Routes */}
        <Route
          path="/complaints"
          element={
            <ComplaintsRoute>
              <Complaints />
            </ComplaintsRoute>
          }
        />

        {/* Inventory Routes */}
        <Route
          path="/inventory"
          element={
            <InventoryRoute>
              <Inventory />
            </InventoryRoute>
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
