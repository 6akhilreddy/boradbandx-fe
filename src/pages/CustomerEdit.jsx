import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Layout from "../components/Layout";
import useCustomerStore from "../store/customerStore";
import useAgentStore from "../store/agentStore";
import usePlanStore from "../store/planStore";
import useAreaStore from "../store/areaStore";
import useUserStore from "../store/userStore";
import Spinner from "../components/Spinner";
import useApiLoading from "../hooks/useApiLoading";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const CustomerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    currentCustomer,
    fetchCustomerById,
    editCustomer,
    clearError,
    clearCurrentCustomer,
  } = useCustomerStore();
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

  // Helper function to format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Handle plan selection to auto-fill agreed monthly price
  const handlePlanChange = (planId) => {
    console.log("Plan changed to:", planId); // Debug log
    const selectedPlan = plans.find(plan => plan.id === parseInt(planId));
    if (selectedPlan) {
      console.log("Selected plan:", selectedPlan); // Debug log
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
    reset,
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
      isActive: true,
      
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
        console.log("Fetching data for customer ID:", id); // Debug log
        await Promise.all([
          fetchAgents(),
          fetchPlans(),
          fetchAreas(),
          fetchCustomerById(id),
        ]);
      } catch (err) {
        console.error("Error fetching data:", err); // Debug log
        setError("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      clearCurrentCustomer();
    };
  }, [id, fetchAgents, fetchPlans, fetchAreas, fetchCustomerById, clearCurrentCustomer]);

  // Populate form when customer data is loaded
  useEffect(() => {
    if (currentCustomer) {
      console.log("Current customer data:", currentCustomer); // Debug log
      console.log("Hardware data:", currentCustomer.hardware); // Debug log
      console.log("Subscription data:", currentCustomer.subscription); // Debug log
      console.log("CustomerHardware (raw):", currentCustomer.CustomerHardware); // Debug log
      console.log("Subscription (raw):", currentCustomer.Subscription); // Debug log
      console.log("CustomerHardwares (raw):", currentCustomer.CustomerHardwares); // Debug log
      console.log("Subscriptions (raw):", currentCustomer.Subscriptions); // Debug log
      
      const formData = {
        // Customer Details
        fullName: currentCustomer.fullName || "",
        phone: currentCustomer.phone || "",
        phoneSecondary: currentCustomer.phoneSecondary || "",
        email: currentCustomer.email || "",
        address: currentCustomer.address || "",
        areaId: currentCustomer.areaId ? currentCustomer.areaId.toString() : "",
        customerCode: currentCustomer.customerCode || "",
        billingName: currentCustomer.billingName || "",
        assignedAgentId: currentCustomer.assignedAgentId ? currentCustomer.assignedAgentId.toString() : (user?.id ? user.id.toString() : ""),
        installationDate: formatDateForInput(currentCustomer.installationDate),
        securityDeposit: currentCustomer.securityDeposit || 0,
        gstNumber: currentCustomer.gstNumber || "",
        advance: currentCustomer.advance || 0,
        remarks: currentCustomer.remarks || "",
        isActive: currentCustomer.isActive !== undefined ? currentCustomer.isActive : true,
        
        // Hardware Details - Use transformed data or fallback to raw data
        deviceType: currentCustomer.hardware?.deviceType || currentCustomer.CustomerHardwares?.[0]?.deviceType || "",
        macAddress: currentCustomer.hardware?.macAddress || currentCustomer.CustomerHardwares?.[0]?.macAddress || "",
        ipAddress: currentCustomer.hardware?.ipAddress || currentCustomer.CustomerHardwares?.[0]?.ipAddress || "",
        
        // Subscription Details - Use transformed data or fallback to raw data
        planId: (currentCustomer.subscription?.planId || currentCustomer.Subscriptions?.[0]?.planId) ? 
          (currentCustomer.subscription?.planId || currentCustomer.Subscriptions?.[0]?.planId).toString() : "",
        startDate: formatDateForInput(currentCustomer.subscription?.startDate || currentCustomer.Subscriptions?.[0]?.startDate),
        agreedMonthlyPrice: currentCustomer.subscription?.agreedMonthlyPrice || currentCustomer.Subscriptions?.[0]?.agreedMonthlyPrice || 0,
        billingType: currentCustomer.subscription?.billingType || currentCustomer.Subscriptions?.[0]?.billingType || "PREPAID",
        billingCycle: currentCustomer.subscription?.billingCycle || currentCustomer.Subscriptions?.[0]?.billingCycle || "MONTHLY",
        billingCycleValue: currentCustomer.subscription?.billingCycleValue || currentCustomer.Subscriptions?.[0]?.billingCycleValue || 1,
        additionalCharge: currentCustomer.subscription?.additionalCharge || currentCustomer.Subscriptions?.[0]?.additionalCharge || 0,
        discount: currentCustomer.subscription?.discount || currentCustomer.Subscriptions?.[0]?.discount || 0,
        status: currentCustomer.subscription?.status || currentCustomer.Subscriptions?.[0]?.status || "ACTIVE",
      };
      
      console.log("Form data to be set:", formData); // Debug log
      console.log("Hardware form data:", {
        deviceType: formData.deviceType,
        macAddress: formData.macAddress,
        ipAddress: formData.ipAddress
      }); // Debug log
      console.log("Subscription form data:", {
        planId: formData.planId,
        startDate: formData.startDate,
        agreedMonthlyPrice: formData.agreedMonthlyPrice
      }); // Debug log
      
      // Use setTimeout to ensure the form is properly reset
      setTimeout(() => {
        // Set all values individually instead of using reset
        Object.keys(formData).forEach(key => {
          setValue(key, formData[key]);
        });
        
        console.log("All form values set individually"); // Debug log
        console.log("Current step:", currentStep); // Debug log
      }, 100);
    }
  }, [currentCustomer, reset, user?.id]);

  const steps = [
    { id: 1, title: "Customer Details" },
    { id: 2, title: "Hardware Details" },
    { id: 3, title: "Subscription Details" },
  ];

  const nextStep = async () => {
    console.log("Next step clicked, current step:", currentStep); // Debug log
    
    // Only validate required fields for the current step
    let isStepValid = true;
    
    if (currentStep === 1) {
      // Validate customer details (required fields)
      console.log("Validating step 1..."); // Debug log
      isStepValid = await trigger(["fullName", "phone", "areaId"]);
      console.log("Step 1 validation result:", isStepValid); // Debug log
    } else if (currentStep === 2) {
      // Hardware details - no required fields, so always valid
      console.log("Step 2 - no validation needed"); // Debug log
      isStepValid = true;
    } else if (currentStep === 3) {
      // Subscription details - validate required fields
      console.log("Validating step 3..."); // Debug log
      isStepValid = await trigger(["planId", "startDate"]);
      console.log("Step 3 validation result:", isStepValid); // Debug log
    }
    
    console.log("Final validation result:", isStepValid); // Debug log
    
    if (isStepValid && currentStep < 3) {
      console.log("Moving to next step:", currentStep + 1); // Debug log
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data) => {
    console.log("Form submitted with data:", data); // Debug log
    console.log("Current step when submitting:", currentStep); // Debug log
    
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
          isActive: data.isActive,
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

      await editCustomer(id, customerData);
      navigate(`/customers/${id}`);
    } catch (err) {
      setError(err.message || "Failed to update customer");
    } finally {
      setLoading(false);
    }
  };

  if ((loading || apiLoading) && !currentCustomer) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Spinner loadingTxt="Loading customer details..." size="medium" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
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
            onClick={() => navigate(`/customers/${id}`)}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md
                       bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500
                       hover:from-purple-600 hover:to-cyan-600
                       transition-transform hover:scale-[1.02] text-sm sm:text-base cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Customer Details
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Edit Customer</h1>
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
        <form onSubmit={(e) => {
          if (currentStep !== 3) {
            e.preventDefault();
            console.log("Form submission prevented - not on final step"); // Debug log
            return;
          }
          handleSubmit(onSubmit)(e);
        }} className="space-y-8">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Installation Date
                  </label>
                  <input
                    type="date"
                    {...register("installationDate")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="dd/mm/yyyy"
                    title="Format: dd/mm/yyyy"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    {...register("isActive")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    {...register("startDate", { required: "Start date is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Format: dd/mm/yyyy"
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                  )}
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prevStep();
              }}
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    nextStep();
                  }}
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
                    <Spinner loadingTxt="Updating..." size="small" />
                    Updating Customer
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 rounded-lg text-white shadow-md bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-transform hover:scale-[1.02] cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Update Customer
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

export default CustomerEdit;
