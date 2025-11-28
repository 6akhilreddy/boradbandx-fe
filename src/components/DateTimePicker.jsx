import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { Calendar, Clock } from "lucide-react";
import "react-day-picker/dist/style.css";

const DateTimePicker = ({
  label,
  name,
  register,
  errors,
  value,
  onChange,
  placeholder = "Select date and time",
  className = "",
  disabled = false,
  minDate,
  maxDate,
  required = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    value ? new Date(value) : null
  );
  const [selectedTime, setSelectedTime] = useState(
    value ? new Date(value).toTimeString().slice(0, 5) : ""
  );
  const containerRef = useRef(null);

  // Update selectedDate and selectedTime when value prop changes
  useEffect(() => {
    if (value && value !== "") {
      try {
        const date = new Date(value);
        setSelectedDate(date);
        setSelectedTime(date.toTimeString().slice(0, 5));
      } catch (e) {
        setSelectedDate(null);
        setSelectedTime("");
      }
    } else {
      setSelectedDate(null);
      setSelectedTime("");
    }
  }, [value]);

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

  const formatDateTime = (date, time) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const [hours, minutes] = time.split(":");
    return `${year}-${month}-${day}T${hours || "00"}:${minutes || "00"}`;
  };

  const formatDisplayDateTime = (date, time) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year} ${time || "00:00"}`;
  };

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
      updateValue(date, selectedTime);
    }
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setSelectedTime(time);
    if (selectedDate) {
      updateValue(selectedDate, time);
    }
  };

  const updateValue = (date, time) => {
    const formattedDateTime = formatDateTime(date, time);
    
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: formattedDateTime,
        },
      });
    }
    
    if (register) {
      const { onChange: registerOnChange } = register(name);
      if (registerOnChange) {
        registerOnChange({
          target: {
            name: name,
            value: formattedDateTime,
          },
        });
      }
    }
  };

  const hasError = errors?.[name];
  const displayValue = selectedDate
    ? formatDisplayDateTime(selectedDate, selectedTime)
    : "";

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
        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        
        {/* Hidden input for react-hook-form */}
        {register && (
          <input
            type="hidden"
            {...register(name)}
            value={
              selectedDate && selectedTime
                ? formatDateTime(selectedDate, selectedTime)
                : ""
            }
          />
        )}
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 relative datetimepicker-container">
          <style>{`
            .datetimepicker-container .rdp-caption {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              width: 100% !important;
              padding: 0 8px !important;
            }
            .datetimepicker-container .rdp-caption_dropdowns {
              display: flex !important;
              gap: 8px !important;
              align-items: center !important;
              flex: 1 !important;
              justify-content: center !important;
            }
            .datetimepicker-container .rdp-dropdown {
              padding: 4px 8px !important;
              border: 1px solid #d1d5db !important;
              border-radius: 6px !important;
              font-size: 14px !important;
              background: white !important;
              cursor: pointer !important;
              min-width: 80px !important;
            }
            .datetimepicker-container .rdp-dropdown:hover {
              border-color: #3b82f6 !important;
            }
            .datetimepicker-container .rdp-dropdown:focus {
              outline: none !important;
              border-color: #3b82f6 !important;
              box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) !important;
            }
            .datetimepicker-container .rdp-nav {
              display: flex !important;
              gap: 0 !important;
            }
          `}</style>
          <div className="space-y-4">
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
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
      
      {hasError && (
        <p className="mt-1 text-sm text-red-600">{errors[name]?.message}</p>
      )}
    </div>
  );
};

export default DateTimePicker;

