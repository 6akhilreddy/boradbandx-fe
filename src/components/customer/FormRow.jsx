import React from "react";

/**
 * Two-column form row: label on the left, control on the right (reference layout).
 */
const FormRow = ({
  label,
  required,
  children,
  className = "",
  align = "left",
  valign = "center",
}) => (
  <div
    className={`grid grid-cols-1 sm:grid-cols-[minmax(160px,38%)_1fr] gap-1 sm:gap-3 py-2.5 ${
      valign === "start" ? "items-start" : "items-center"
    } ${className}`}
  >
    <label
      className={`text-sm font-normal text-gray-800 ${
        align === "right" ? "sm:text-right sm:pr-2" : "sm:pr-2"
      }`}
    >
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
      <span className="hidden sm:inline"> :</span>
    </label>
    <div className="min-w-0">{children}</div>
  </div>
);

export default FormRow;
