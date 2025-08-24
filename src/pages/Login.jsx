import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ROUTES from "../config/routes";
import { useState } from "react";
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
  const { setUser } = useUserStore();
  const isLoading = useApiLoading();

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setApiError("");
    try {
      const response = await login(data.phone, data.password);
      setUser(response.user);
      localStorage.setItem("token", response.token);
      navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      setApiError(errorMessage);
    }
  };

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
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          {/* Submit button with pointer + pressed effect */}
          <button
            type="submit"
            className={[
              // layout & sizing (fixed height prevents reflow)
              "relative flex justify-center items-center h-12 px-4",
              // visuals
              "rounded-md bg-indigo-600 text-white",
              // stable shadow (no big jumps)
              "shadow-lg hover:shadow-xl active:shadow-lg",
              // press effect isolated to the button
              "transform-gpu will-change-transform transition-transform duration-75 active:scale-[0.98]",
              // interactions
              "hover:bg-indigo-700 cursor-pointer select-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              // disabled
              "disabled:bg-indigo-300 disabled:cursor-not-allowed disabled:shadow-none",
            ].join(" ")}
            disabled={isLoading}
          >
            {isLoading ? <Spinner loadingTxt="Logging in" /> : "Login"}
          </button>
        </form>

        {apiError && (
          <p className="text-red-500 mt-4 text-center">{apiError}</p>
        )}
      </div>
    </div>
  );
};

export default Login;
