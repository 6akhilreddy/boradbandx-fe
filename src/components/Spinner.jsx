import React from "react";

const Spinner = ({ 
  loadingTxt = "", 
  size = "medium", 
  color = "gradient",
  className = ""
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      spinner: "h-4 w-4",
      text: "text-sm",
      container: "gap-2"
    },
    medium: {
      spinner: "h-6 w-6", 
      text: "text-base",
      container: "gap-3"
    },
    large: {
      spinner: "h-12 w-12",
      text: "text-lg",
      container: "gap-4"
    }
  };

  // Color configurations
  const colorConfig = {
    gradient: {
      spinner: "text-purple-500",
      text: "text-gray-600"
    },
    white: {
      spinner: "text-white",
      text: "text-white"
    },
    gray: {
      spinner: "text-gray-500",
      text: "text-gray-500"
    }
  };

  const config = sizeConfig[size] || sizeConfig.medium;
  const colorStyle = colorConfig[color] || colorConfig.gradient;

  return (
    <div className={`flex items-center justify-center ${config.container} ${className}`}>
      <div className={`${config.spinner} ${colorStyle.spinner} relative`}>
        <svg className="animate-spin w-full h-full" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke={color === "gradient" ? "url(#spinnerGradient)" : "currentColor"}
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill={color === "gradient" ? "url(#spinnerGradient)" : "currentColor"}
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {loadingTxt && (
        <span className={`${config.text} ${colorStyle.text} font-medium`}>
          {loadingTxt}
        </span>
      )}
    </div>
  );
};

export default Spinner;
