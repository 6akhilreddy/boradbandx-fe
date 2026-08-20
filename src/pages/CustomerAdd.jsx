import React, { useState, useEffect, useRef } from "react";
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
import { ArrowLeft, ArrowRight, Check, Plus, X } from "lucide-react";
import FormRow from "../components/customer/FormRow";
import CustomerGeneralTab from "../components/customer/CustomerGeneralTab";
import CustomerBillingTab from "../components/customer/CustomerBillingTab";
import CustomerPlansTab from "../components/customer/CustomerPlansTab";
import { getNextBillingNumber } from "../api/customerApi";
import { uploadCustomerDocuments } from "../api/customerApi";

const TABS = [
  { id: 1, title: "General Details" },
  { id: 2, title: "Hardware Details" },
  { id: 3, title: "Upload Documents" },
  { id: 4, title: "Billing Details" },
  { id: 5, title: "Plans" },
];

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const CustomerAdd = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingFileName, setPendingFileName] = useState("");
  const fileInputRef = useRef(null);
  const documentsRef = useRef([]);

  const [selectedPlans, setSelectedPlans] = useState([]);
  const [planTab, setPlanTab] = useState("plans");
  const [fixedBillAmount, setFixedBillAmount] = useState("");
  const [nextBillingNumber, setNextBillingNumber] = useState(null);
  const [billingNumberLoading, setBillingNumberLoading] = useState(true);

  const { addCustomer } = useCustomerStore();
  const { agents, fetchAgents } = useAgentStore();
  const { plans, fetchPlans } = usePlanStore();
  const { areas, fetchAreas } = useAreaStore();
  const { user } = useUserStore();
  const apiLoading = useApiLoading();

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      phone: "",
      phoneSecondary: "",
      email: "",
      address: "",
      areaId: "",
      customerCode: "",
      billingName: "",
      latitude: "",
      longitude: "",
      assignedAgentId: user?.id || "",
      installationDate: today,
      securityDeposit: 0,
      gstNumber: "",
      remarks: "",
      deviceType: "",
      macAddress: "",
      ipAddress: "",
      membershipNumber: "",
      billingStartDate: today,
      openingBalance: 0,
      openingBalanceType: "OUTSTANDING",
      billingType: "POSTPAID",
      billingCycle: "MONTHLY",
      billingCycleValue: 1,
      monthlyAdditionalCharge: 0,
      monthlyDiscount: 0,
      chargeDiscountMode: "CHARGE",
      gstType: "NONE",
      fixedBillAmount: "",
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (user?.id) setValue("assignedAgentId", String(user.id));
    setValue("installationDate", today);
    setValue("billingStartDate", today);
  }, [user?.id, setValue, today]);

  const groupedPlanLines = () => {
    const map = new Map();
    for (const p of selectedPlans) {
      const id = p.id;
      if (map.has(id)) {
        map.get(id).quantity += 1;
      } else {
        map.set(id, {
          planId: id,
          quantity: 1,
          agreedMonthlyPrice: p.monthlyPrice,
        });
      }
    }
    return [...map.values()];
  };

  const canCreateCustomer = () => {
    const { fullName, phone, areaId, billingStartDate } = watchedValues;
    const phoneValid =
      !phone || phone.trim() === "" || /^[0-9]{10}$/.test(phone);
    const hasPlans = selectedPlans.length > 0;
    const hasFixed =
      planTab === "fixed" && parseFloat(fixedBillAmount) > 0;
    return (
      fullName?.trim() &&
      phoneValid &&
      areaId &&
      billingStartDate &&
      (hasPlans || hasFixed)
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setBillingNumberLoading(true);
        const [, , , billingRes] = await Promise.all([
          fetchAgents(),
          fetchPlans(),
          fetchAreas(),
          getNextBillingNumber().catch(() => ({ billingNumber: null })),
        ]);
        setNextBillingNumber(billingRes?.billingNumber ?? null);
      } catch {
        setError("Failed to load form data");
      } finally {
        setLoading(false);
        setBillingNumberLoading(false);
      }
    };
    fetchData();
  }, [fetchAgents, fetchPlans, fetchAreas]);

  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  useEffect(() => {
    return () => {
      documentsRef.current.forEach((doc) => {
        if (doc.previewUrl) URL.revokeObjectURL(doc.previewUrl);
      });
    };
  }, []);

  const goToPrevTab = () => {
    if (activeTab > 1) setActiveTab(activeTab - 1);
  };

  const goToNextTab = () => {
    if (activeTab < TABS.length) setActiveTab(activeTab + 1);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = "";
  };

  const handleAddDocument = () => {
    if (!pendingFile) return;
    const displayName = pendingFileName.trim() || pendingFile.name;
    const previewUrl = URL.createObjectURL(pendingFile);
    setDocuments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        file: pendingFile,
        fileName: displayName,
        previewUrl,
        isImage: pendingFile.type.startsWith("image/"),
      },
    ]);
    setPendingFile(null);
    setPendingFileName("");
  };

  const handleRemoveDocument = (id) => {
    setDocuments((prev) => {
      const doc = prev.find((d) => d.id === id);
      if (doc?.previewUrl) URL.revokeObjectURL(doc.previewUrl);
      return prev.filter((d) => d.id !== id);
    });
  };

  const handleAddPlan = (plan, qty) => {
    const entries = Array.from({ length: qty }, () => ({ ...plan }));
    setSelectedPlans((prev) => [...prev, ...entries]);
    setPlanTab("plans");
    setFixedBillAmount("");
    setValue("fixedBillAmount", "");
  };

  const handleRemovePlan = (planId) => {
    setSelectedPlans((prev) => {
      const idx = prev.findIndex((p) => p.id === planId);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  };

  const onSubmit = async (data) => {
    if (!canCreateCustomer()) return;

    try {
      setLoading(true);
      setError(null);

      const planLines = groupedPlanLines();
      const fixed =
        planTab === "fixed" ? parseFloat(fixedBillAmount) || 0 : null;

      const customerData = {
        customer: {
          fullName: data.fullName,
          phone: data.phone?.trim() || null,
          phoneSecondary: data.phoneSecondary || null,
          email: data.email || null,
          address: data.address,
          areaId: parseInt(data.areaId, 10),
          customerCode: data.customerCode,
          billingName: data.billingName,
          latitude: data.latitude,
          longitude: data.longitude,
          assignedAgentId: data.assignedAgentId
            ? parseInt(data.assignedAgentId, 10)
            : null,
          installationDate: data.installationDate,
          securityDeposit: parseFloat(data.securityDeposit) || 0,
          gstNumber: data.gstNumber,
          remarks: data.remarks,
          createdBy: user.id,
          billingStartDate: data.billingStartDate,
          openingBalance: parseFloat(data.openingBalance) || 0,
          openingBalanceType: data.openingBalanceType,
          billingType: data.billingType,
          billingCycle: data.billingCycle,
          billingCycleValue: parseInt(data.billingCycleValue, 10) || 1,
          monthlyAdditionalCharge:
            data.chargeDiscountMode === "DISCOUNT"
              ? 0
              : parseFloat(data.monthlyAdditionalCharge) || 0,
          monthlyDiscount:
            data.chargeDiscountMode === "DISCOUNT"
              ? parseFloat(data.monthlyDiscount) || 0
              : 0,
          gstType: data.gstType,
          fixedBillAmount: fixed,
        },
        hardware: {
          deviceType: data.deviceType,
          macAddress: data.macAddress,
          ipAddress: data.ipAddress,
          membershipNumber: data.membershipNumber,
        },
        planLines,
      };

      const created = await addCustomer(customerData);

      // Upload documents (if any) after customer is created
      if (documents.length > 0 && created?.id) {
        const formData = new FormData();
        documents.forEach((d) => {
          formData.append("files", d.file);
          formData.append("fileNames", d.fileName);
        });
        await uploadCustomerDocuments(created.id, formData);
      }
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

  const handleCreateCustomerClick = handleSubmit(onSubmit);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md
                       bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500
                       hover:from-purple-600 hover:to-cyan-600
                       transition-transform hover:scale-[1.02] text-sm sm:text-base cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Customers
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Add Customer</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="flex flex-wrap gap-1 p-3 border-b border-gray-200 bg-gray-50/50">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 1 && (
                <CustomerGeneralTab
                  register={register}
                  errors={errors}
                  watch={watch}
                  areas={areas}
                  agents={agents}
                  user={user}
                  nextBillingNumber={nextBillingNumber}
                  billingNumberLoading={billingNumberLoading}
                />
              )}

              {activeTab === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
                  <FormRow label="ROUTER">
                    <input
                      type="text"
                      {...register("deviceType")}
                      placeholder="Router"
                      className={inputClass}
                    />
                  </FormRow>
                  <FormRow label="IP">
                    <input
                      type="text"
                      {...register("ipAddress")}
                      placeholder="IP address"
                      className={inputClass}
                    />
                  </FormRow>
                  <FormRow label="MAC">
                    <input
                      type="text"
                      {...register("macAddress")}
                      placeholder="MAC"
                      className={inputClass}
                    />
                  </FormRow>
                  <FormRow label="MEMBERSHIP Number">
                    <input
                      type="text"
                      {...register("membershipNumber")}
                      placeholder="Membership/Account Number"
                      className={inputClass}
                    />
                  </FormRow>
                </div>
              )}

              {activeTab === 3 && (
                <div className="max-w-2xl">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Upload Documents :
                  </label>
                  <div className="space-y-3 border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="shrink-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
                      >
                        Choose File
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileSelect}
                      />
                      <input
                        type="text"
                        readOnly
                        value={pendingFile?.name || ""}
                        placeholder="No file chosen"
                        className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <span className="shrink-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center">
                        File Name
                      </span>
                      <input
                        type="text"
                        value={pendingFileName}
                        onChange={(e) => setPendingFileName(e.target.value)}
                        placeholder="e.g. Aadhar card"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={handleAddDocument}
                        disabled={!pendingFile}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                    {documents.length > 0 && (
                      <div className="pt-4 mt-4 border-t flex flex-wrap gap-4">
                        {documents.map((doc) => (
                          <div key={doc.id} className="relative">
                            <div className="border-2 border-blue-200 rounded-lg p-2">
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(doc.id)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              {doc.isImage ? (
                                <img
                                  src={doc.previewUrl}
                                  alt={doc.fileName}
                                  className="w-32 h-32 object-cover rounded"
                                />
                              ) : (
                                <div className="w-32 h-32 flex items-center justify-center bg-gray-100 text-xs text-center px-2">
                                  {doc.file.name}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-blue-600 text-center mt-2 truncate max-w-[140px]">
                              {doc.fileName}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 4 && (
                <CustomerBillingTab
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                />
              )}

              {activeTab === 5 && (
                <CustomerPlansTab
                  plans={plans}
                  selectedPlans={selectedPlans}
                  onAddPlan={handleAddPlan}
                  onRemovePlan={handleRemovePlan}
                  onClearPlans={() => setSelectedPlans([])}
                  fixedBillAmount={fixedBillAmount}
                  onFixedBillAmountChange={(v) => {
                    setFixedBillAmount(v);
                    setValue("fixedBillAmount", v);
                    if (parseFloat(v) > 0) setSelectedPlans([]);
                  }}
                  planTab={planTab}
                  onPlanTabChange={(tab) => {
                    setPlanTab(tab);
                    if (tab === "fixed") setSelectedPlans([]);
                  }}
                />
              )}
            </div>
          </div>

          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              type="button"
              onClick={goToPrevTab}
              disabled={activeTab === 1}
              className="flex items-center gap-2 px-8 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              PREV.
            </button>

            {activeTab < TABS.length ? (
              <button
                type="button"
                onClick={goToNextTab}
                className="flex items-center gap-2 px-8 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 cursor-pointer"
              >
                NEXT
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : loading ? (
              <div className="flex items-center gap-2 px-8 py-2.5 bg-gray-400 text-white text-sm font-semibold rounded-lg">
                <Spinner loadingTxt="Creating..." size="small" />
                Creating Customer
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCreateCustomerClick}
                disabled={!canCreateCustomer()}
                title={
                  !canCreateCustomer()
                    ? "Fill required fields and add at least one plan or fixed bill amount"
                    : undefined
                }
                className="flex items-center gap-2 px-8 py-2.5 text-sm font-semibold rounded-lg text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
              >
                <Check className="w-4 h-4" />
                Create Customer
              </button>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CustomerAdd;
