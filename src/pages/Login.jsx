import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ROUTES from "../config/routes";
import { useState, useEffect } from "react";
import { login } from "../api/authApi";
import useUserStore from "../store/userStore";
import useApiLoading from "../hooks/useApiLoading";
import Spinner from "../components/Spinner";
import { Wifi, Phone, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const user = useUserStore((state) => state.user);
  const token = useUserStore((state) => state.token);
  const setUser = useUserStore((state) => state.setUser);
  const isLoading = useApiLoading();

  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already authenticated and redirect
  useEffect(() => {
    const isAuthenticated = !!(user && token);
    if (isAuthenticated && user) {
      const dashboardRoute = getDashboardRoute(user.roleCode);
      navigate(dashboardRoute, { replace: true });
    }
  }, [user, token, navigate]);

  const getDashboardRoute = (roleCode) => {
    switch (roleCode) {
      case "SUPER_ADMIN":
        return ROUTES.SUPER_ADMIN_DASHBOARD;
      case "ADMIN":
        return ROUTES.ADMIN_DASHBOARD;
      case "AGENT":
        return ROUTES.AGENT_DASHBOARD;
      default:
        return ROUTES.ADMIN_DASHBOARD;
    }
  };

  const onSubmit = async (data) => {
    setApiError("");
    try {
      const response = await login(data.phone, data.password);
      
      // Set user data with role and permission information
      setUser(response.user, response.token);
      
      // Redirect based on user role
      const dashboardRoute = getDashboardRoute(response.user.roleCode);
      navigate(dashboardRoute, { replace: true });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      setApiError(errorMessage);
    }
  };

  // If already authenticated, show loading
  const isAuthenticated = !!(user && token);
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-4">
        <div className="bg-white p-8 shadow-2xl rounded-2xl w-full max-w-md text-center">
          <Spinner loadingTxt="Redirecting to dashboard..." size="medium" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-4">
      <div className="bg-white p-8 shadow-2xl rounded-2xl w-full max-w-md">
        {/* Icon + Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-100 p-4 rounded-full shadow-md">
            <Wifi className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-3">BroadbandX</h1>
        </div>

        <p className="text-gray-500 text-center mb-6">
          Please login to your account
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Phone Number */}
          <label className="sr-only" htmlFor="phone">
            Phone Number
          </label>
          <div className="flex items-center border border-gray-300 rounded-md p-2 focus-within:ring-2 focus-within:ring-indigo-500">
            <Phone className="text-gray-400 w-5 h-5 mr-2" />
            <input
              id="phone"
              type="tel"
              placeholder="Phone Number"
              {...register("phone", { required: "Phone number is required" })}
              className="flex-1 outline-none"
              disabled={isLoading}
              inputMode="tel"
              autoComplete="tel"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}

          {/* Password with Eye toggle */}
          <label className="sr-only" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <div className="flex items-center border border-gray-300 rounded-md p-2 pr-10 focus-within:ring-2 focus-within:ring-indigo-500">
              <Lock className="text-gray-400 w-5 h-5 mr-2" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", { required: "Password is required" })}
                className="flex-1 outline-none"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              tabIndex={0}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          {/* Error Message */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {apiError}
            </div>
          )}

          {/* Submit Button or Loading Spinner */}
          {isLoading ? (
            <div className="flex justify-center py-3">
              <Spinner loadingTxt="Signing in..." size="medium" />
            </div>
          ) : (
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white py-3 px-4 rounded-md font-medium hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
            >
              Sign In
            </button>
          )}
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Admin:</strong> 9876543210 / adminpass123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
