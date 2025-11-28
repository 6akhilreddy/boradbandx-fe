import React, { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

const Toast = ({ 
  type = "success", 
  message, 
  onClose, 
  autoDismiss = true, 
  duration = 3000 
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

  const toastStyles = {
    success: {
      container: "bg-green-50 border border-green-200 text-green-800 shadow-lg",
      icon: "text-green-500",
      closeButton: "text-green-700 hover:text-green-900"
    },
    error: {
      container: "bg-red-50 border border-red-200 text-red-800 shadow-lg",
      icon: "text-red-500", 
      closeButton: "text-red-700 hover:text-red-900"
    }
  };

  const style = toastStyles[type];

  return (
    <div className={`fixed top-4 right-4 z-[10000] px-4 py-3 rounded-lg flex items-center gap-3 min-w-[300px] max-w-md ${style.container} animate-in slide-in-from-top-5`}>
      <div className="flex items-center gap-2 flex-1">
        {type === "success" ? (
          <CheckCircle className={`w-5 h-5 ${style.icon}`} />
        ) : (
          <XCircle className={`w-5 h-5 ${style.icon}`} />
        )}
        <span className="font-medium text-sm">{message}</span>
      </div>
      <button 
        onClick={onClose}
        className={`text-lg font-bold ${style.closeButton} hover:opacity-70 transition-opacity`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;


