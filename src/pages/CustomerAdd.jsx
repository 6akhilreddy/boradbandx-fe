import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Layout from "../components/Layout";
import useApiLoading from "../hooks/useApiLoading";
import useCustomerStore from "../store/customerStore";
import useAgentStore from "../store/agentStore";
import usePlanStore from "../store/planStore";
import useAreaStore from "../store/areaStore";
import useUserStore from "../store/userStore";
import Spinner from "../components/Spinner";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import DatePicker from "../components/DatePicker";

const CustomerAdd = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { addCustomer } = useCustomerStore();
  const { agents, fetchAgents } = useAgentStore();
  const { plans, fetchPlans } = usePlanStore();
  const { areas, fetchAreas } = useAreaStore();
  const { user } = useUserStore();
  const apiLoading = useApiLoading();

  // Helper function to format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // dd/mm/yyyy format
  };

  // Handle plan selection to auto-fill agreed monthly price
  const handlePlanChange = (planId) => {
    const selectedPlan = plans.find(plan => plan.id === parseInt(planId));
    if (selectedPlan) {
      setValue("agreedMonthlyPrice", selectedPlan.monthlyPrice);
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      // Customer Details
      fullName: "",
      phone: "",
      phoneSecondary: "",
      email: "",
      address: "",
      areaId: "",
      customerCode: "",
      billingName: "",
      assignedAgentId: user?.id || "",
      installationDate: new Date().toISOString().split('T')[0],
      securityDeposit: 0,
      gstNumber: "",
      advance: 0,
      remarks: "",
      
      // Hardware Details
      deviceType: "",
      macAddress: "",
      ipAddress: "",
      
      // Subscription Details
      planId: "",
      startDate: new Date().toISOString().split('T')[0],
      agreedMonthlyPrice: 0,
      billingType: "PREPAID",
      billingCycle: "MONTHLY",
      billingCycleValue: 1,
      additionalCharge: 0,
      discount: 0,
      status: "ACTIVE",
    },
  });

  // Fetch required data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchAgents(),
          fetchPlans(),
          fetchAreas(),
        ]);
      } catch (err) {
        setError("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchAgents, fetchPlans, fetchAreas]);



  const steps = [
    { id: 1, title: "Customer Details" },
    { id: 2, title: "Hardware Details" },
    { id: 3, title: "Subscription Details" },
  ];

  const nextStep = async () => {
    const isStepValid = await trigger();
    if (isStepValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const customerData = {
        customer: {
          fullName: data.fullName,
          phone: data.phone,
          phoneSecondary: data.phoneSecondary,
          email: data.email,
          address: data.address,
          areaId: parseInt(data.areaId),
          customerCode: data.customerCode,
          billingName: data.billingName,
          assignedAgentId: data.assignedAgentId ? parseInt(data.assignedAgentId) : null,
          installationDate: data.installationDate,
          securityDeposit: parseFloat(data.securityDeposit),
          gstNumber: data.gstNumber,
          advance: parseInt(data.advance),
          remarks: data.remarks,
          createdBy: user.id,
        },
        hardware: {
          deviceType: data.deviceType,
          macAddress: data.macAddress,
          ipAddress: data.ipAddress,
        },
        subscription: {
          planId: parseInt(data.planId),
          startDate: data.startDate,
          agreedMonthlyPrice: parseFloat(data.agreedMonthlyPrice),
          billingType: data.billingType,
          billingCycle: data.billingCycle,
          billingCycleValue: parseInt(data.billingCycleValue),
          additionalCharge: parseFloat(data.additionalCharge),
          discount: parseFloat(data.discount),
          status: data.status,
        },
      };

      await addCustomer(customerData);
      navigate("/customers");
    } catch (err) {
      setError(err.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  if ((loading || apiLoading) && !agents.length && !plans.length) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Spinner loadingTxt="Loading form data..." size="medium" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/customers")}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md
                       bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500
                       hover:from-purple-600 hover:to-cyan-600
                       transition-transform hover:scale-[1.02] text-sm sm:text-base cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Customers
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Add New Customer</h1>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center max-w-xs sm:max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 z-10 relative ${
                    currentStep >= step.id
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 text-gray-500 bg-white"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <span className="text-sm sm:text-base">{step.id}</span>
                  )}
                </div>
                <div className="ml-2 sm:ml-3 hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 sm:w-32 md:w-40 h-0.5 mx-2 sm:mx-4 md:mx-6 relative">
                    <div
                      className={`h-full w-full ${
                        currentStep > step.id ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Customer Details */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    {...register("fullName", { required: "Full name is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Code
                  </label>
                  <input
                    type="text"
                    {...register("customerCode")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter customer code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Name
                  </label>
                  <input
                    type="text"
                    {...register("billingName")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter billing name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    {...register("phone", { 
                      required: "Phone is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Phone number must be 10 digits"
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Phone
                  </label>
                  <input
                    type="tel"
                    {...register("phoneSecondary", {
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Phone number must be 10 digits"
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register("email", {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area *
                  </label>
                  <select
                    {...register("areaId", { required: "Area is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Area</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.areaName}
                      </option>
                    ))}
                  </select>
                  {errors.areaId && (
                    <p className="text-red-500 text-sm mt-1">{errors.areaId.message}</p>
                  )}
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Agent
                  </label>
                  <select
                    {...register("assignedAgentId")}
                    disabled={user?.roleCode === "AGENT"}
                    defaultValue={user?.id || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Agent</option>
                    {user?.roleCode === "ADMIN" && (
                      <option value={user.id}>
                        {user.name} (Admin)
                      </option>
                    )}
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <DatePicker
                    label="Installation Date"
                    name="installationDate"
                    register={register}
                    errors={errors}
                    placeholder="dd/mm/yyyy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Deposit
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("securityDeposit", { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    {...register("gstNumber")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advance Payment
                  </label>
                  <input
                    type="number"
                    {...register("advance", { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    {...register("address")}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    {...register("remarks")}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Hardware Details */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Hardware Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Type
                  </label>
                  <input
                    type="text"
                    {...register("deviceType")}
                    placeholder="e.g., Router, Modem, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MAC Address
                  </label>
                  <input
                    type="text"
                    {...register("macAddress")}
                    placeholder="00:1A:2B:3C:4D:5E"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IP Address
                  </label>
                  <input
                    type="text"
                    {...register("ipAddress")}
                    placeholder="192.168.1.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Subscription Details */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Subscription Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan *
                  </label>
                  <select
                    {...register("planId", { required: "Plan is required" })}
                    onChange={(e) => {
                      register("planId").onChange(e);
                      handlePlanChange(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Plan</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - ₹{plan.monthlyPrice}
                      </option>
                    ))}
                  </select>
                  {errors.planId && (
                    <p className="text-red-500 text-sm mt-1">{errors.planId.message}</p>
                  )}
                </div>

                <div>
                  <DatePicker
                    label="Start Date"
                    name="startDate"
                    register={register}
                    errors={errors}
                    required={true}
                    placeholder="dd/mm/yyyy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agreed Monthly Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("agreedMonthlyPrice", { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Type
                  </label>
                  <select
                    {...register("billingType")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="POSTPAID">Postpaid</option>
                    <option value="PREPAID">Prepaid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Cycle
                  </label>
                  <select
                    {...register("billingCycle")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="DAILY">Daily</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Cycle Value
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...register("billingCycleValue", { min: 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Charge
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("additionalCharge", { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("discount", { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="CHANGED">Changed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-3">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg text-white shadow-md
                             bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500
                             hover:from-purple-600 hover:to-cyan-600
                             transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                loading ? (
                  <div className="flex items-center gap-2 px-6 py-2 rounded-lg text-white shadow-md">
                    <Spinner loadingTxt="Creating..." size="small" />
                    Creating Customer
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 rounded-lg text-white shadow-md bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-transform hover:scale-[1.02] cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Create Customer
                  </button>
                )
              )}
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CustomerAdd;
