import React, { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

const Alert = ({ 
  type = "success", 
  message, 
  onClose, 
  autoDismiss = true, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (autoDismiss && message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, autoDismiss, duration, onClose]);

  if (!message) return null;

  const alertStyles = {
    success: {
      container: "bg-green-50 border border-green-200 text-green-700",
      icon: "text-green-400",
      closeButton: "text-green-700 hover:text-green-900"
    },
    error: {
      container: "bg-red-50 border border-red-200 text-red-700",
      icon: "text-red-400", 
      closeButton: "text-red-700 hover:text-red-900"
    }
  };

  const style = alertStyles[type];

  return (
    <div className={`px-4 py-3 rounded-lg flex justify-between items-center ${style.container}`}>
      <div className="flex items-center gap-2">
        {type === "success" ? (
          <CheckCircle className={`w-5 h-5 ${style.icon}`} />
        ) : (
          <XCircle className={`w-5 h-5 ${style.icon}`} />
        )}
        <span className="font-medium">{message}</span>
      </div>
      <button 
        onClick={onClose}
        className={`text-lg font-bold ${style.closeButton}`}
      >
        ×
      </button>
    </div>
  );
};

export default Alert;
