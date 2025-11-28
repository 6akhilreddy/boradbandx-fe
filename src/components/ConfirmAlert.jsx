import React from "react";
import { AlertTriangle, X } from "lucide-react";

const ConfirmAlert = ({
  show,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "danger", // "danger" or "warning"
}) => {
  if (!show) return null;

  const typeStyles = {
    danger: {
      icon: "text-red-600",
      button: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: "text-yellow-600",
      button: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 ${style.icon}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 mb-4">{message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${style.button}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAlert;

