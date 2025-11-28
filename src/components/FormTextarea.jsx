import React from "react";

const FormTextarea = ({
  label,
  name,
  register,
  errors,
  placeholder = "",
  rows = 4,
  className = "",
  ...props
}) => {
  const hasError = errors[name];
  
  return (
    <div>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          {label}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        rows={rows}
        {...register(name)}
        {...props}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          hasError
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300"
        } ${className}`}
      />
      {hasError && (
        <p className="mt-1 text-sm text-red-600">{errors[name]?.message}</p>
      )}
    </div>
  );
};

export default FormTextarea;

