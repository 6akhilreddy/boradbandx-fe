import React, { useMemo } from "react";
import DatePicker from "../DatePicker";
import CurrencyInput from "./CurrencyInput";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm";

const cardClass = "border border-gray-300 rounded-md p-4 sm:p-5 bg-white";

const billingRowClass =
  "grid grid-cols-1 sm:grid-cols-[minmax(200px,48%)_1fr] gap-2 sm:gap-4 items-center py-2.5";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Reference format: 01-May-2026 */
function formatBillingRefDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTHS_SHORT[d.getMonth()];
  return `${day}-${month}-${d.getFullYear()}`;
}

const RadioOption = ({ name, value, label, checked, onChange }) => (
  <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-800">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-gray-900 border-gray-400 focus:ring-blue-500"
    />
    {label}
  </label>
);

const CustomerBillingTab = ({ register, watch, setValue, errors }) => {
  const billing = watch();
  const {
    billingStartDate,
    openingBalance,
    openingBalanceType,
    monthlyAdditionalCharge,
    monthlyDiscount,
    chargeDiscountMode,
    billingCycle,
    billingCycleValue,
    billingType,
    gstType,
  } = billing;

  const dayBeforeStart = useMemo(() => {
    if (!billingStartDate) return null;
    const d = new Date(`${billingStartDate}T12:00:00`);
    d.setDate(d.getDate() - 1);
    return d;
  }, [billingStartDate]);

  const prevDayLabel = dayBeforeStart
    ? formatBillingRefDate(dayBeforeStart.toISOString().split("T")[0])
    : "—";

  const startFmt = formatBillingRefDate(billingStartDate);

  const ob = parseFloat(openingBalance) || 0;
  const openingText =
    openingBalanceType === "ADVANCE"
      ? `Automatic Bills will be generated from ${startFmt} and ₹ ${ob} will be subtracted from bill`
      : `Automatic Bills will be generated from ${startFmt} and ₹ ${ob} will be added to bill`;

  const adjAmount =
    chargeDiscountMode === "DISCOUNT"
      ? parseFloat(monthlyDiscount) || 0
      : parseFloat(monthlyAdditionalCharge) || 0;
  const adjText =
    chargeDiscountMode === "DISCOUNT"
      ? `₹ ${adjAmount} will be subtracted from every bill`
      : `₹ ${adjAmount} will be added to every bill`;

  const cycleVal = parseInt(billingCycleValue, 10) || 1;
  let durationText = "";
  if (billingCycle === "END_OF_MONTH") {
    durationText = "Bill will be generated automatically at the end of month.";
  } else if (billingCycle === "DAILY") {
    durationText = `Bill will be generated automatically after every ${cycleVal} day(s).`;
  } else {
    durationText = `Bill will be generated automatically after every ${cycleVal} month(s).`;
  }

  const billTypeText =
    billingType === "PREPAID" ? "Advance Billing." : "Normal Billing.";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Start Date & Opening Balance — reference layout */}
      <div className={cardClass}>
        <div className={billingRowClass}>
          <label className="text-sm text-gray-800">
            Start Date
            <span className="text-red-500 ml-0.5">*</span>
            <span className="hidden sm:inline"> :</span>
          </label>
          <DatePicker
            name="billingStartDate"
            register={register}
            errors={errors}
            value={billingStartDate}
            required
            placeholder="dd/mm/yyyy"
            className={inputClass}
          />
        </div>

        <div className={billingRowClass}>
          <p className="text-sm text-gray-800 leading-snug">
            Till <span className="font-semibold">{prevDayLabel}</span> opening
            balance is :
          </p>
          <CurrencyInput
            register={register}
            name="openingBalance"
            rules={{ min: 0 }}
            className="max-w-full sm:max-w-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[minmax(200px,48%)_1fr] gap-2 sm:gap-4 py-2">
          <span className="hidden sm:block" aria-hidden="true" />
          <div className="flex flex-wrap items-center gap-6">
            <RadioOption
              name="openingBalanceType"
              value="OUTSTANDING"
              label="Outstanding"
              checked={openingBalanceType === "OUTSTANDING"}
              onChange={() => setValue("openingBalanceType", "OUTSTANDING")}
            />
            <RadioOption
              name="openingBalanceType"
              value="ADVANCE"
              label="Advance"
              checked={openingBalanceType === "ADVANCE"}
              onChange={() => setValue("openingBalanceType", "ADVANCE")}
            />
          </div>
        </div>

        <p className="text-xs sm:text-sm text-red-600 mt-1 pt-2 border-t border-gray-100">
          {openingText}
        </p>
      </div>

      <div className={cardClass}>
        <div className={billingRowClass}>
          <label className="text-sm text-gray-800">
            Additional Charge/Discount per month
            <span className="hidden sm:inline"> :</span>
          </label>
          <CurrencyInput
            register={register}
            name={
              chargeDiscountMode === "DISCOUNT"
                ? "monthlyDiscount"
                : "monthlyAdditionalCharge"
            }
            rules={{ min: 0 }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(200px,48%)_1fr] gap-2 sm:gap-4 py-2">
          <span className="hidden sm:block" aria-hidden="true" />
          <div className="flex flex-wrap items-center gap-6">
            <RadioOption
              name="chargeDiscountMode"
              value="CHARGE"
              label="Additional Charge"
              checked={chargeDiscountMode !== "DISCOUNT"}
              onChange={() => {
                setValue("chargeDiscountMode", "CHARGE");
                setValue("monthlyDiscount", 0);
              }}
            />
            <RadioOption
              name="chargeDiscountMode"
              value="DISCOUNT"
              label="Discount"
              checked={chargeDiscountMode === "DISCOUNT"}
              onChange={() => {
                setValue("chargeDiscountMode", "DISCOUNT");
                setValue("monthlyAdditionalCharge", 0);
              }}
            />
          </div>
        </div>
        <p className="text-xs sm:text-sm text-red-600 mt-1 pt-2 border-t border-gray-100">
          {adjText}
        </p>
      </div>

      <div className={cardClass}>
        <p className="text-sm font-medium text-gray-800 mb-3">Bill Duration</p>
        <div className="flex flex-wrap gap-4 mb-3">
          <RadioOption
            name="billingCycle"
            value="DAILY"
            label="Days"
            checked={billingCycle === "DAILY"}
            onChange={() => setValue("billingCycle", "DAILY")}
          />
          <RadioOption
            name="billingCycle"
            value="MONTHLY"
            label="Months"
            checked={billingCycle === "MONTHLY"}
            onChange={() => setValue("billingCycle", "MONTHLY")}
          />
          <RadioOption
            name="billingCycle"
            value="END_OF_MONTH"
            label="End of every month"
            checked={billingCycle === "END_OF_MONTH"}
            onChange={() => {
              setValue("billingCycle", "END_OF_MONTH");
              setValue("billingCycleValue", 1);
            }}
          />
        </div>
        {billingCycle !== "END_OF_MONTH" && (
          <select
            {...register("billingCycleValue", { min: 1 })}
            className={inputClass}
          >
            {[1, 2, 3, 6, 12].map((n) => (
              <option key={n} value={n}>
                Every {n} {billingCycle === "DAILY" ? "Day(s)" : "Month(s)"}
              </option>
            ))}
          </select>
        )}
        <p className="text-xs sm:text-sm text-red-600 mt-3">{durationText}</p>
      </div>

      <div className={cardClass}>
        <p className="text-sm font-medium text-gray-800 mb-3">Bill Type</p>
        <div className="flex flex-wrap gap-6">
          <RadioOption
            name="billingType"
            value="POSTPAID"
            label="Postpaid"
            checked={billingType === "POSTPAID"}
            onChange={() => setValue("billingType", "POSTPAID")}
          />
          <RadioOption
            name="billingType"
            value="PREPAID"
            label="Prepaid"
            checked={billingType === "PREPAID"}
            onChange={() => setValue("billingType", "PREPAID")}
          />
        </div>
        <p className="text-xs sm:text-sm text-red-600 mt-3">{billTypeText}</p>
      </div>

      <div className={`${cardClass} lg:col-span-2`}>
        <p className="text-sm font-medium text-gray-800 mb-3">GST Type</p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6">
          <RadioOption
            name="gstType"
            value="NONE"
            label="No GST"
            checked={gstType === "NONE"}
            onChange={() => setValue("gstType", "NONE")}
          />
          <RadioOption
            name="gstType"
            value="CGST_SGST"
            label="CGST + SGST - Customer from same state"
            checked={gstType === "CGST_SGST"}
            onChange={() => setValue("gstType", "CGST_SGST")}
          />
          <RadioOption
            name="gstType"
            value="IGST"
            label="IGST - Customer from different state"
            checked={gstType === "IGST"}
            onChange={() => setValue("gstType", "IGST")}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerBillingTab;
