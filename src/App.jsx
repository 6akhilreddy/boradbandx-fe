import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import routes from "./config/routes"; // Import routes file
import PERMISSIONS from "./config/permissions";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Customers from "./pages/Customers";
function App() {
  return (
   <Router>
      <Routes>
        <Route path={routes.LOGIN} element={<Login />} />
        <Route path={routes.UNAUTHORIZED} element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_SUPER_ADMIN_DASHBOARD} />
          }
        >
          <Route path={routes.SUPER_ADMIN_DASHBOARD} element={<SuperAdminDashboard />} />
        </Route>

        {/* Admin Protected Route */}
        <Route
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ADMIN_DASHBOARD} />
          }
        >
          <Route path={routes.ADMIN_DASHBOARD} element={<AdminDashboard />} />
        </Route>

        {/* Customers Protected Route */}
        <Route
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_CUSTOMERS} />
          }
        >
          <Route path="/customers" element={<Customers />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
