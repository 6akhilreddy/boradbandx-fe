import React from "react";

const FormInput = ({
  label,
  name,
  register,
  errors,
  type = "text",
  placeholder = "",
  step,
  min,
  className = "",
  ...props
}) => {
  const hasError = errors?.[name];
  
  return (
    <div>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          {label}
        </label>
      )}
      <input
        type={type}
        step={step}
        min={min}
        placeholder={placeholder}
        name={name}
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

export default FormInput;

