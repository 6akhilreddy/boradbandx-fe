import React from "react";
import FormRow from "./FormRow";
import DatePicker from "../DatePicker";
import CurrencyInput from "./CurrencyInput";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm";

const CustomerGeneralTab = ({
  register,
  errors,
  watch,
  areas,
  agents,
  user,
  nextBillingNumber,
  billingNumberLoading,
}) => {
  const installationDate = watch("installationDate");

  return (
    <div className="border border-gray-300 rounded-md bg-white">
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 lg:gap-x-16">
          <FormRow label="Customer Name" required>
            <input
              type="text"
              {...register("fullName", {
                required: "Customer name is required",
              })}
              className={inputClass}
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fullName.message}
              </p>
            )}
          </FormRow>

          <FormRow label="Customer Billing Name">
            <input
              type="text"
              {...register("billingName")}
              className={inputClass}
            />
          </FormRow>

          <FormRow label="Billing Area" required>
            <select
              {...register("areaId", { required: "Billing area is required" })}
              className={inputClass}
            >
              <option value="">Select Area</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.areaName}
                </option>
              ))}
            </select>
            {errors.areaId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.areaId.message}
              </p>
            )}
          </FormRow>

          <FormRow label="Billing No">
            <input
              type="text"
              readOnly
              value={
                billingNumberLoading
                  ? "Loading..."
                  : nextBillingNumber != null
                    ? String(nextBillingNumber)
                    : "—"
              }
              className={`${inputClass} bg-gray-50 text-gray-800 cursor-default font-medium`}
            />
          </FormRow>

          <FormRow label="Mobile Number 1">
            <input
              type="tel"
              {...register("phone", {
                validate: (v) =>
                  !v ||
                  /^[0-9]{10}$/.test(v) ||
                  "Phone number must be 10 digits",
              })}
              className={inputClass}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
            )}
          </FormRow>

          <FormRow label="Mobile Number 2">
            <input
              type="tel"
              {...register("phoneSecondary", {
                validate: (v) =>
                  !v ||
                  /^[0-9]{10}$/.test(v) ||
                  "Phone number must be 10 digits",
              })}
              className={inputClass}
            />
            {errors.phoneSecondary && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phoneSecondary.message}
              </p>
            )}
          </FormRow>

          <FormRow label="Email">
            <input type="email" {...register("email")} className={inputClass} />
          </FormRow>

          <FormRow label="Security Deposit">
            <CurrencyInput
              register={register}
              name="securityDeposit"
              rules={{ min: 0 }}
            />
          </FormRow>

          <FormRow label="Customer Code">
            <input
              type="text"
              {...register("customerCode")}
              className={inputClass}
            />
          </FormRow>

          <FormRow label="GST No">
            <input type="text" {...register("gstNumber")} className={inputClass} />
          </FormRow>

          <FormRow label="Address" valign="start">
            <textarea
              {...register("address")}
              rows={3}
              className={`${inputClass} resize-y min-h-[72px]`}
            />
          </FormRow>

          <FormRow label="Remark" valign="start">
            <textarea
              {...register("remarks")}
              rows={3}
              className={`${inputClass} resize-y min-h-[72px]`}
            />
          </FormRow>

          <FormRow label="Latitude">
            <input type="text" {...register("latitude")} className={inputClass} />
          </FormRow>
          <FormRow label="Longitude">
            <input type="text" {...register("longitude")} className={inputClass} />
          </FormRow>
          <FormRow label="Assigned Agent">
            <select
              {...register("assignedAgentId")}
              disabled={user?.roleCode === "AGENT"}
              className={`${inputClass} disabled:bg-gray-50 disabled:cursor-not-allowed`}
            >
              <option value="">Select Agent</option>
              {user?.roleCode === "ADMIN" && (
                <option value={user.id}>{user.name} (Admin)</option>
              )}
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </FormRow>
          <FormRow label="Installation Date">
            <DatePicker
              name="installationDate"
              register={register}
              errors={errors}
              value={installationDate}
              placeholder="dd/mm/yyyy"
            />
          </FormRow>
        </div>
      </div>
    </div>
  );
};

export default CustomerGeneralTab;
