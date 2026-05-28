import React from "react";

const baseInputClass =
  "w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm";

/**
 * Number input with ₹ prefix inside the field (aligned with other inputs).
 */
const CurrencyInput = ({
  register,
  name,
  rules,
  className = "",
  step = "0.01",
  min = 0,
  placeholder = "0",
}) => {
  const { ref, ...reg } = register(name, rules);

  return (
    <div className="relative w-full">
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none select-none"
        aria-hidden
      >
        ₹
      </span>
      <input
        type="number"
        step={step}
        min={min}
        placeholder={placeholder}
        ref={ref}
        {...reg}
        className={`${baseInputClass} ${className}`}
      />
    </div>
  );
};

export default CurrencyInput;
