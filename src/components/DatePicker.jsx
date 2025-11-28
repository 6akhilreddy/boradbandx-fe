import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { Calendar } from "lucide-react";
import "react-day-picker/dist/style.css";

const DatePicker = ({
  label,
  name,
  register,
  errors,
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  disabled = false,
  minDate,
  maxDate,
  required = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, right: 'auto' });
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Update selectedDate when value prop changes
  useEffect(() => {
    if (value && value !== "") {
      try {
        setSelectedDate(new Date(value));
      } catch (e) {
        setSelectedDate(null);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Calculate dropdown position to prevent overflow
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 320; // maxWidth from style
      const spaceOnRight = viewportWidth - rect.right;
      const spaceOnLeft = rect.left;

      // If there's not enough space on the right, align to the right edge
      if (spaceOnRight < dropdownWidth && spaceOnLeft > spaceOnRight) {
        setDropdownPosition({ left: 'auto', right: 0 });
      } else {
        setDropdownPosition({ left: 0, right: 'auto' });
      }
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
      const formattedDate = formatDate(date);
      
      // Create event object for onChange
      const event = {
        target: {
          name: name,
          value: formattedDate,
        },
      };
      
      // Handle onChange - support both event object and direct value
      if (onChange) {
        onChange(event);
      }
      
      // Also trigger register's onChange if register exists (for react-hook-form)
      if (register) {
        const { onChange: registerOnChange } = register(name);
        if (registerOnChange) {
          registerOnChange(event);
        }
      }
      
      setIsOpen(false);
    }
  };

  const hasError = errors?.[name];
  const displayValue = selectedDate ? formatDisplayDate(selectedDate) : "";

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={displayValue}
          placeholder={placeholder}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer ${
            hasError
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${className}`}
          {...props}
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        
        {/* Hidden input for react-hook-form to register the field */}
        {register && (
          <input
            type="hidden"
            {...register(name)}
            value={selectedDate ? formatDate(selectedDate) : ""}
            onChange={(e) => {
              // This will be handled by handleDateSelect
            }}
          />
        )}
      </div>
      
      {isOpen && !disabled && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 datepicker-container" 
          style={{ 
            top: '100%', 
            left: dropdownPosition.left,
            right: dropdownPosition.right,
            minWidth: '280px',
            maxWidth: '320px'
          }}
        >
          <style>{`
            .datepicker-container .rdp-caption {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              width: 100% !important;
              padding: 0 8px !important;
            }
            .datepicker-container .rdp-caption_dropdowns {
              display: flex !important;
              gap: 8px !important;
              align-items: center !important;
              flex: 1 !important;
              justify-content: center !important;
            }
            .datepicker-container .rdp-dropdown {
              padding: 4px 8px !important;
              border: 1px solid #d1d5db !important;
              border-radius: 6px !important;
              font-size: 14px !important;
              background: white !important;
              cursor: pointer !important;
              min-width: 80px !important;
            }
            .datepicker-container .rdp-dropdown:hover {
              border-color: #3b82f6 !important;
            }
            .datepicker-container .rdp-dropdown:focus {
              outline: none !important;
              border-color: #3b82f6 !important;
              box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) !important;
            }
            .datepicker-container .rdp-nav {
              display: flex !important;
              gap: 0 !important;
            }
          `}</style>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={disabled}
            captionLayout="dropdown"
            navLayout="around"
            {...(minDate && { fromDate: new Date(minDate) })}
            {...(maxDate && { toDate: new Date(maxDate) })}
            className="rdp"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center mb-2",
              caption_label: "text-sm font-medium text-gray-900",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded hover:bg-gray-100",
              nav_button_previous: "",
              nav_button_next: "",
              dropdown_month: "px-2 py-1 border border-gray-300 rounded text-sm",
              dropdown_year: "px-2 py-1 border border-gray-300 rounded text-sm",
              dropdown_icon: "ml-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-100 rounded-md",
              day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
              day_today: "bg-blue-100 text-blue-900 font-semibold",
              day_outside: "text-gray-400 opacity-50",
              day_disabled: "text-gray-300 opacity-50",
              day_range_middle: "aria-selected:bg-blue-50 aria-selected:text-blue-900",
              day_hidden: "invisible",
            }}
          />
        </div>
      )}
      
      {hasError && (
        <p className="mt-1 text-sm text-red-600">{errors[name]?.message}</p>
      )}
    </div>
  );
};

export default DatePicker;

