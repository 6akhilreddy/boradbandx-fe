import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Layout from "../components/Layout";
import useCustomerStore from "../store/customerStore";
import Spinner from "../components/Spinner";
import useApiLoading from "../hooks/useApiLoading";
import Toast from "../components/Toast";
import FormInput from "../components/FormInput";
import FormTextarea from "../components/FormTextarea";
import FormSelect from "../components/FormSelect";
import ConfirmAlert from "../components/ConfirmAlert";
import {
  ArrowLeft,
  MapPin,
  Share2,
  Send,
  Calendar,
  Scale,
  RefreshCw,
  List,
  RotateCw,
  Plus,
  FileText,
  Monitor,
  User,
  Upload,
  Edit,
  X,
  Download,
  Trash2,
  Banknote,
  Receipt,
  Hand,
  Search,
} from "lucide-react";
import DatePicker from "../components/DatePicker";
import DateTimePicker from "../components/DateTimePicker";
import {
  getCustomerPaymentDetails,
  recordPayment,
} from "../api/paymentApi";
import {
  addOnBill,
  adjustBalance,
  renewSubscription,
  updateCustomer,
  generateBill,
} from "../api/customerApi";
import { getPlans } from "../api/planApi";
import axiosInstance from "../api/axiosInstance";

const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("collect-payment");
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Payment form with react-hook-form
  const {
    register: registerPayment,
    handleSubmit: handlePaymentSubmit,
    formState: { errors: paymentErrors },
    reset: resetPayment,
    watch: watchPayment,
    trigger, // Add trigger for manual validation
  } = useForm({
    mode: "onChange", // Validate on change for real-time feedback
    reValidateMode: "onChange", // Re-validate on change
    defaultValues: {
      amount: "",
      discount: 0,
      method: "CASH",
      recordTime: getCurrentDateTime(),
      comments: "",
    },
  });

  // Add-on bill form
  const {
    register: registerAddOn,
    handleSubmit: handleAddOnSubmit,
    formState: { errors: addOnErrors },
    reset: resetAddOn,
    watch: watchAddOn,
  } = useForm({
    defaultValues: {
      itemName: "",
      price: "",
    },
  });

  // Adjust balance form
  const {
    register: registerAdjust,
    handleSubmit: handleAdjustSubmit,
    formState: { errors: adjustErrors },
    reset: resetAdjust,
    watch: watchAdjust,
  } = useForm({
    defaultValues: {
      newBalance: "",
      reason: "",
    },
  });

  // Renew form
  const {
    register: registerRenew,
    handleSubmit: handleRenewSubmit,
    formState: { errors: renewErrors },
    reset: resetRenew,
    watch: watchRenew,
    setValue: setRenewValue,
  } = useForm({
    defaultValues: {
      fromDate: "",
      toDate: "",
      period: "1 Months",
    },
  });

  const [showPlanPopup, setShowPlanPopup] = useState(false);
  const [plans, setPlans] = useState([]);
  const [searchPlanQuery, setSearchPlanQuery] = useState("");
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [activeTab, setActiveTab] = useState("plans"); // "plans" or "fixed"
  const [fixedBillAmount, setFixedBillAmount] = useState("");
  const [showGenerateBillModal, setShowGenerateBillModal] = useState(false);
  const [billItems, setBillItems] = useState([]);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [additionalAmount, setAdditionalAmount] = useState(0);
  const [billPeriodStart, setBillPeriodStart] = useState("");
  const [billPeriodEnd, setBillPeriodEnd] = useState("");
  const [generatedInvoiceId, setGeneratedInvoiceId] = useState(null);
  const [confirmAlert, setConfirmAlert] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger",
  });
  const [hardwareForm, setHardwareForm] = useState({
    deviceType: "",
    macAddress: "",
    ipAddress: "",
  });
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");

  // Watch payment form values for calculations
  const paymentAmount = watchPayment("amount");
  const paymentDiscount = watchPayment("discount");
  const addOnPrice = watchAddOn("price");
  const [balanceHistory, setBalanceHistory] = useState({
    transactions: [],
    loading: false,
    error: null,
  });
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [showPaymentPreview, setShowPaymentPreview] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const {
    currentCustomer,
    loading,
    error,
    fetchCustomerById,
    clearError,
    clearCurrentCustomer,
  } = useCustomerStore();
  const apiLoading = useApiLoading();

  useEffect(() => {
    if (id) {
      fetchCustomerById(id);
      loadPaymentDetails();
    }
    return () => {
      clearCurrentCustomer();
    };
  }, [id]);

  // Sync hardware form with current customer
  useEffect(() => {
    if (currentCustomer?.hardware) {
      setHardwareForm({
        deviceType: currentCustomer.hardware.deviceType || "",
        macAddress: currentCustomer.hardware.macAddress || "",
        ipAddress: currentCustomer.hardware.ipAddress || "",
      });
    }
  }, [currentCustomer?.hardware]);

  // Sync follow up form with current customer
  useEffect(() => {
    if (currentCustomer) {
      setFollowUpDate(currentCustomer.followUpDate || new Date().toISOString().split("T")[0]);
      setFollowUpNotes(currentCustomer.followUpNotes || "");
    }
  }, [currentCustomer?.followUpDate, currentCustomer?.followUpNotes]);

  useEffect(() => {
    if (id && activeSection === "balance-history") {
      loadBalanceHistory();
    }
  }, [id, activeSection]);

  const loadPaymentDetails = async () => {
    try {
      const response = await getCustomerPaymentDetails(id);
      if (response.success) {
        setPaymentDetails(response.data);
      }
    } catch (error) {
      console.error("Failed to load payment details:", error);
    }
  };

  const loadBalanceHistory = async () => {
    try {
      setBalanceHistory({ ...balanceHistory, loading: true, error: null });
      const response = await axiosInstance.get(`/customers/${id}/balance-history`);
      if (response.data.success) {
        setBalanceHistory({
          transactions: response.data.data.transactions || [],
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Failed to load balance history:", error);
      setBalanceHistory({
        ...balanceHistory,
        loading: false,
        error: "Failed to load balance history",
      });
    }
  };

  const handleRowClick = async (transaction) => {
    if (transaction.type === "INVOICE" && transaction.invoice) {
      // Fetch invoice details
      try {
        const response = await axiosInstance.get(`/customers/invoices/${transaction.invoice.id}`);
        if (response.data.success) {
          setInvoiceDetails(response.data.data);
          setSelectedInvoice(response.data.data);
          setShowInvoicePreview(true);
        }
      } catch (error) {
        console.error("Failed to load invoice details:", error);
      }
    } else if (transaction.type === "BALANCE_ADJUSTMENT" && transaction.invoice) {
      // Fetch balance adjustment invoice details
      try {
        const response = await axiosInstance.get(`/customers/invoices/${transaction.invoice.id}`);
        if (response.data.success) {
          setSelectedInvoice(response.data.data);
          setShowInvoicePreview(true);
        }
      } catch (error) {
        console.error("Failed to load balance adjustment details:", error);
      }
    } else if (transaction.type === "ADD_ON_BILL" && transaction.invoice) {
      // Fetch add-on bill invoice details
      try {
        const response = await axiosInstance.get(`/customers/invoices/${transaction.invoice.id}`);
        if (response.data.success) {
          setSelectedInvoice(response.data.data);
          setShowInvoicePreview(true);
        }
      } catch (error) {
        console.error("Failed to load add-on bill details:", error);
      }
    } else if (transaction.type === "PAYMENT" && transaction.payment) {
      // Fetch payment details
      try {
        const response = await axiosInstance.get(`/payments/${transaction.payment.id}`);
        if (response.data.success) {
          setSelectedPaymentDetails(response.data.data);
          setSelectedPayment(response.data.data);
          setShowPaymentPreview(true);
        }
      } catch (error) {
        console.error("Failed to load payment details:", error);
      }
    }
  };

  const handleDeleteTransaction = async (transactionId, e) => {
    e.stopPropagation();
    setConfirmAlert({
      show: true,
      title: "Delete Transaction",
      message: "Are you sure you want to delete this transaction? This will recalculate balances for all subsequent transactions.",
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/customers/transactions/${transactionId}`);
          setToast({ show: true, type: "success", message: "Transaction deleted successfully" });
          setConfirmAlert({ ...confirmAlert, show: false });
          await loadBalanceHistory();
          await loadPaymentDetails();
          await fetchCustomerById(id);
        } catch (error) {
          console.error("Failed to delete transaction:", error);
          setToast({ show: true, type: "error", message: error.response?.data?.message || "Failed to delete transaction" });
          setConfirmAlert({ ...confirmAlert, show: false });
        }
      },
      type: "danger",
    });
  };

  const handleDeletePayment = async (paymentId, e) => {
    e.stopPropagation();
    setConfirmAlert({
      show: true,
      title: "Delete Payment",
      message: "Are you sure you want to delete this payment? This will recalculate balances for all subsequent transactions.",
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/payments/${paymentId}`);
          setToast({ show: true, type: "success", message: "Payment deleted successfully" });
          setConfirmAlert({ ...confirmAlert, show: false });
          await loadBalanceHistory();
          await loadPaymentDetails();
          await fetchCustomerById(id);
        } catch (error) {
          console.error("Failed to delete payment:", error);
          setToast({ show: true, type: "error", message: error.response?.data?.message || "Failed to delete payment" });
          setConfirmAlert({ ...confirmAlert, show: false });
        }
      },
      type: "danger",
    });
  };

  // Get latest subscription invoice date to determine which items can be deleted
  const getLatestInvoiceDate = () => {
    const invoices = balanceHistory.transactions.filter(
      (t) => t.type === "INVOICE" && t.invoice?.type === "SUBSCRIPTION"
    );
    if (invoices.length === 0) return null;
    const latestInvoice = invoices.sort(
      (a, b) => new Date(b.transactionDate || b.recordedDate) - new Date(a.transactionDate || a.recordedDate)
    )[0];
    return new Date(latestInvoice.transactionDate || latestInvoice.recordedDate);
  };

  const canDeleteTransaction = (transaction, index) => {
    // Only allow delete on the latest (first) transaction in the list
    // Balance history is ordered by date DESC, so index 0 is the latest
    if (index !== 0) return false;
    
    // Cannot delete subscription invoices
    if (transaction.type === "INVOICE" && transaction.invoice?.type === "SUBSCRIPTION") return false;
    
    const latestInvoiceDate = getLatestInvoiceDate();
    if (!latestInvoiceDate) return true; // Can delete if no subscription invoice exists
    
    const transactionDate = new Date(transaction.transactionDate || transaction.recordedDate);
    return transactionDate >= latestInvoiceDate;
  };

  const handleAdjustBalance = async (data) => {
    try {
      const response = await adjustBalance(id, {
        newBalance: parseFloat(data.newBalance),
        reason: data.reason || "",
      });
      if (response.success) {
        setToast({ show: true, type: "success", message: "Balance adjusted successfully" });
        resetAdjust({ newBalance: "", reason: "" });
        await loadBalanceHistory();
        await loadPaymentDetails();
        await fetchCustomerById(id);
      }
    } catch (error) {
      console.error("Failed to adjust balance:", error);
      setToast({ show: true, type: "error", message: error.response?.data?.message || "Failed to adjust balance" });
    }
  };

  const handleAddOnBill = async (data) => {
    try {
      const response = await addOnBill(id, {
        itemName: data.itemName,
        price: parseFloat(data.price),
      });
      if (response.success) {
        setToast({ show: true, type: "success", message: "Add on bill created successfully" });
        resetAddOn({ itemName: "", price: "" });
        await loadBalanceHistory();
        await loadPaymentDetails();
        await fetchCustomerById(id);
      }
    } catch (error) {
      console.error("Failed to add on bill:", error);
      setToast({ show: true, type: "error", message: error.response?.data?.message || "Failed to add on bill" });
    }
  };

  // Calculate dates based on last bill date and period
  const calculateRenewDates = (baseDate, period) => {
    if (!baseDate) return { fromDate: "", toDate: "" };
    
    const lastBillDate = new Date(baseDate);
    const fromDate = new Date(lastBillDate);
    fromDate.setDate(fromDate.getDate() + 1); // Next day after last bill date
    
    const toDate = new Date(fromDate);
    const periodMonths = parseInt(period) || 1;
    toDate.setMonth(toDate.getMonth() + periodMonths);
    toDate.setDate(toDate.getDate() - 1); // Last day of the period
    
    return {
      fromDate: fromDate.toISOString().split("T")[0],
      toDate: toDate.toISOString().split("T")[0],
    };
  };

  // Calculate dates from today based on period
  const calculateRenewDatesFromToday = (period) => {
    const today = new Date();
    const toDate = new Date(today);
    const periodMonths = parseInt(period) || 1;
    toDate.setMonth(toDate.getMonth() + periodMonths);
    toDate.setDate(toDate.getDate() - 1); // Last day of the period
    
    return {
      fromDate: today.toISOString().split("T")[0],
      toDate: toDate.toISOString().split("T")[0],
    };
  };


  const prepareBillItems = () => {
    const items = [];
    
    // Add selected plans as items
    selectedPlans.forEach((plan) => {
      items.push({
        name: plan.name,
        quantity: 1,
        unitPrice: plan.monthlyPrice || 0,
        totalAmount: plan.monthlyPrice || 0,
        itemType: "INTERNET_SERVICE",
        editable: true,
      });
    });
    
    // Add fixed bill amount if selected
    if (activeTab === "fixed" && fixedBillAmount) {
      items.push({
        name: "Fixed Bill Amount",
        quantity: 1,
        unitPrice: parseFloat(fixedBillAmount) || 0,
        totalAmount: parseFloat(fixedBillAmount) || 0,
        itemType: "FIXED_BILL",
        editable: true,
      });
    }
    
    return items;
  };

  const openGenerateBillModal = (fromDate, toDate) => {
    let items = [];
    let plansToUse = [];
    
    // Priority 1: Use selectedPlans if available
    if (selectedPlans.length > 0) {
      plansToUse = selectedPlans;
    }
    // Priority 2: Use current subscriptions
    else if (currentCustomer?.subscriptions && currentCustomer.subscriptions.length > 0) {
      plansToUse = currentCustomer.subscriptions
        .filter(sub => sub.plan && (sub.plan.monthlyPrice > 0 || sub.agreedMonthlyPrice > 0))
        .map(sub => {
          const price = sub.plan.monthlyPrice || sub.agreedMonthlyPrice || 0;
          return {
            id: sub.plan.id || sub.planId,
            name: sub.plan.name,
            monthlyPrice: price,
            code: sub.plan.code,
          };
        });
      // Update selectedPlans so they show in the popup
      if (plansToUse.length > 0) {
        setSelectedPlans(plansToUse);
      }
    }
    // Priority 3: Use current subscription (backward compatibility)
    else if (currentCustomer?.subscription?.plan) {
      const price = currentCustomer.subscription.plan.monthlyPrice || currentCustomer.subscription.agreedMonthlyPrice || 0;
      if (price > 0) {
        plansToUse = [{
          id: currentCustomer.subscription.plan.id || currentCustomer.subscription.planId,
          name: currentCustomer.subscription.plan.name,
          monthlyPrice: price,
          code: currentCustomer.subscription.plan.code,
        }];
        setSelectedPlans(plansToUse);
      }
    }
    
    // Create items from plans
    if (plansToUse.length > 0) {
      items = plansToUse
        .filter(plan => plan.monthlyPrice > 0) // Only include plans with valid prices
        .map((plan) => ({
          name: plan.name,
          quantity: 1,
          unitPrice: plan.monthlyPrice || 0,
          totalAmount: plan.monthlyPrice || 0,
          itemType: "INTERNET_SERVICE",
          editable: true,
          planId: plan.id,
        }));
      
      // If no valid plans found, show error
      if (items.length === 0) {
        setToast({
          show: true,
          type: "error",
          message: "No valid subscriptions found. Please select plans or add subscriptions first.",
        });
        return;
      }
    }
    // Priority 4: Use prepareBillItems (for fixed bill amount)
    else {
      items = prepareBillItems();
      // If still no items, show error
      if (items.length === 0) {
        setToast({
          show: true,
          type: "error",
          message: "No subscription or bill items found. Please select plans or enter a fixed bill amount.",
        });
        return;
      }
    }
    
    setBillItems(items);
    setBillPeriodStart(fromDate);
    setBillPeriodEnd(toDate);
    setAdditionalAmount(0);
    setShowGenerateBillModal(true);
  };

  const handleRenew = async (data) => {
    // Open Generate Bill modal instead of directly renewing
    openGenerateBillModal(data.fromDate, data.toDate);
  };

  const handleRenewFromToday = () => {
    const period = watchRenew("period") || "1 Months";
    const dates = calculateRenewDatesFromToday(period);
    openGenerateBillModal(dates.fromDate, dates.toDate);
  };

  const handleToggleActiveStatus = async (isActive) => {
    try {
      await updateCustomer(id, {
        customer: { isActive },
      });
      setToast({ 
        show: true, 
        type: "success", 
        message: `Customer ${isActive ? "activated" : "deactivated"} successfully` 
      });
      await fetchCustomerById(id);
    } catch (error) {
      console.error("Failed to update customer status:", error);
      setToast({ 
        show: true, 
        type: "error", 
        message: error.response?.data?.message || "Failed to update customer status" 
      });
    }
  };

  const loadPlans = async () => {
    try {
      const response = await getPlans({ isActive: true });
      setPlans(response || []);
    } catch (error) {
      console.error("Failed to load plans:", error);
      setToast({ 
        show: true, 
        type: "error", 
        message: "Failed to load plans" 
      });
    }
  };

  const handleOpenPlanPopup = () => {
    setShowPlanPopup(true);
    setActiveTab("plans");
    setFixedBillAmount("");
    loadPlans().then(() => {
      // Add current subscriptions to selected plans by default
      const subscriptions = currentCustomer?.subscriptions || (currentCustomer?.subscription ? [currentCustomer.subscription] : []);
      if (subscriptions.length > 0) {
        const currentPlans = subscriptions
          .filter(sub => sub.plan)
          .map(sub => ({
            id: sub.plan.id || sub.planId,
            name: sub.plan.name,
            monthlyPrice: sub.plan.monthlyPrice || sub.agreedMonthlyPrice,
            code: sub.plan.code,
          }));
        setSelectedPlans(currentPlans);
      }
    });
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlans((prev) => {
      const exists = prev.find((p) => p.id === plan.id);
      if (exists) {
        return prev.filter((p) => p.id !== plan.id);
      }
      return [...prev, plan];
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleDateString("en-IN", { month: "short" });
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleRecordPayment = async (data) => {
    try {
      console.log("Form data received:", data); // Debug log
      console.log("Amount value:", data.amount, "Type:", typeof data.amount);
      
      // Convert to numbers - handle both string and number inputs
      let amount;
      if (data.amount === "" || data.amount === null || data.amount === undefined) {
        setToast({ show: true, type: "error", message: "Please enter a payment amount" });
        return;
      }
      
      // Try to convert to number
      amount = typeof data.amount === "string" ? parseFloat(data.amount) : data.amount;
      
      console.log("Amount after conversion:", amount, "Type:", typeof amount, "isNaN:", isNaN(amount));
      
      // Validate amount
      if (isNaN(amount) || amount <= 0) {
        console.log("Validation failed - amount is invalid:", amount);
        setToast({ show: true, type: "error", message: "Please enter a valid payment amount greater than 0" });
        return;
      }

      // Handle discount
      let discount = data.discount;
      if (discount === "" || discount === null || discount === undefined || discount === "0" || discount === 0) {
        discount = 0;
      } else if (typeof discount === "string") {
        discount = parseFloat(discount) || 0;
      } else if (typeof discount === "number") {
        discount = isNaN(discount) ? 0 : discount;
      }
      
      console.log("Processed values - amount:", amount, "discount:", discount); // Debug log

      console.log("Calling recordPayment API with:", {
        customerId: id,
        amount: amount,
        discount: discount,
        method: data.method,
      });
      
      const response = await recordPayment({
        customerId: id,
        amount: amount,
        discount: discount,
        method: data.method,
        comments: data.comments || "",
      });
      console.log("Payment recorded successfully:", response); // Debug log
      await loadPaymentDetails();
      await fetchCustomerById(id);
      await loadBalanceHistory();
      resetPayment({
        amount: "",
        discount: 0,
        method: "CASH",
        recordTime: getCurrentDateTime(),
        comments: "",
      });
      setToast({ show: true, type: "success", message: "Payment recorded successfully!" });
    } catch (error) {
      console.error("Failed to record payment:", error);
      setToast({ show: true, type: "error", message: error.response?.data?.message || "Failed to record payment. Please try again." });
    }
  };

  const calculateTotalPayment = () => {
    const amount = paymentAmount ? parseFloat(paymentAmount) : 0;
    const discount = paymentDiscount ? parseFloat(paymentDiscount) : 0;
    return amount - discount;
  };

  const calculateNewBalance = () => {
    // Use balance from currentCustomer, paymentDetails, or balanceHistory
    const currentBalance = currentCustomer.balance !== undefined 
      ? currentCustomer.balance 
      : paymentDetails?.balanceAmount !== undefined
      ? paymentDetails.balanceAmount
      : balanceHistory.transactions.length > 0 
      ? balanceHistory.transactions[0].balanceAfter || 0
      : 0;
    return Math.max(0, currentBalance - calculateTotalPayment());
  };

  const calculateNewBalanceForAddOn = () => {
    // Use balance from currentCustomer, paymentDetails, or balanceHistory
    const currentBalance = currentCustomer.balance !== undefined 
      ? currentCustomer.balance 
      : paymentDetails?.balanceAmount !== undefined
      ? paymentDetails.balanceAmount
      : balanceHistory.transactions.length > 0 
      ? balanceHistory.transactions[0].balanceAfter || 0
      : 0;
    const price = addOnPrice ? parseFloat(addOnPrice) : 0;
    return currentBalance + price;
  };

  // Watch period changes to auto-update dates (must be before early returns)
  const renewPeriod = watchRenew("period");
  useEffect(() => {
    if (currentCustomer?.latestInvoice?.periodEnd && renewPeriod) {
      const dates = calculateRenewDates(currentCustomer.latestInvoice.periodEnd, renewPeriod);
      setRenewValue("fromDate", dates.fromDate);
      setRenewValue("toDate", dates.toDate);
    }
  }, [renewPeriod, currentCustomer?.latestInvoice?.periodEnd, setRenewValue]);

  // Auto-fill dates when component loads or last bill date changes (must be before early returns)
  useEffect(() => {
    if (currentCustomer?.latestInvoice?.periodEnd && activeSection === "renew") {
      const dates = calculateRenewDates(currentCustomer.latestInvoice.periodEnd, renewPeriod || "1 Months");
      setRenewValue("fromDate", dates.fromDate);
      setRenewValue("toDate", dates.toDate);
    }
  }, [currentCustomer?.latestInvoice?.periodEnd, activeSection, renewPeriod, setRenewValue]);

  if (loading || apiLoading) {
    return (
      <Layout>
        <Spinner loadingTxt="Loading customer details..." size="medium" />
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

  if (!currentCustomer) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Customer not found</p>
        </div>
      </Layout>
    );
  }

  const latestInvoice = currentCustomer.latestInvoice;
  // Get lastPayment from paymentDetails (from getCustomerPaymentDetails API) which is more reliable
  const lastPayment = paymentDetails?.lastPayment || latestInvoice?.lastPayment;
  // Get balance from currentCustomer (from getCustomerById API) or paymentDetails
  // This ensures balance is always available, not just when balance-history tab is active
  const balance = currentCustomer.balance !== undefined 
    ? currentCustomer.balance 
    : paymentDetails?.balanceAmount !== undefined
    ? paymentDetails.balanceAmount
    : balanceHistory.transactions.length > 0 
    ? balanceHistory.transactions[0].balanceAfter || 0
    : 0;
  const lastBillDate = latestInvoice?.dueDate
    ? formatDate(latestInvoice.dueDate)
    : "N/A";
  const lastBillAmount = paymentDetails?.lastBillAmount || latestInvoice?.amountTotal || 0;
  const lastPaymentAmount = lastPayment?.amount || 0;
  const lastPaymentDate = lastPayment?.date
    ? formatDate(lastPayment.date)
    : "N/A";

  const menuItems = [
    { id: "collect-payment", label: "Collect Payment", icon: Scale },
    { id: "renew", label: "Renew", icon: RefreshCw },
    { id: "subscription", label: "Subscription", icon: List },
    { id: "adjust-balance", label: "Adjust Balance", icon: RotateCw },
    { id: "add-on-bill", label: "Add On Bill", icon: Plus },
    { id: "balance-history", label: "Balance History", icon: FileText },
    { id: "hardware-details", label: "Hardware Details", icon: Monitor },
    { id: "customer-follow-up", label: "Customer Follow Up", icon: Calendar },
    { id: "customer-edit", label: "Customer Edit", icon: User },
    { id: "upload-documents", label: "Upload Documents", icon: Upload },
  ];

  const renderMainContent = () => {
    switch (activeSection) {
      case "collect-payment":
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Collect Payment
              </h2>
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm">
                  <MapPin className="w-4 h-4" />
                  Customer Location
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm">
                  <Share2 className="w-4 h-4" />
                  Advance payment link
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm">
                  <Share2 className="w-4 h-4" />
                  Share Reminder Message
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left Column - Customer Financial Summary Cards */}
              <div className="lg:col-span-2 space-y-4">
                {/* Balance Amount Card */}
                <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                  <label className="text-sm font-medium text-gray-500 mb-2 block">
                    Balance Amount
                  </label>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ₹ {balance.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Till Date : {lastBillDate}</span>
                    <button className="text-blue-600 hover:text-blue-700 text-xs underline">
                      edits
                    </button>
                  </div>
                </div>

                {/* Last Bill Amount Card */}
                <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                  <label className="text-sm font-medium text-gray-500 mb-2 block">
                    Last Bill Amount
                  </label>
                  <div className="text-3xl font-bold text-gray-900">
                    ₹ {lastBillAmount.toFixed(2)}
                  </div>
                </div>

                {/* Last Payment Card */}
                <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                  <label className="text-sm font-medium text-gray-500 mb-2 block">
                    Last Payment
                  </label>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ₹ {lastPaymentAmount.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Collected on : {lastPaymentDate}
                  </div>
                </div>
              </div>

              {/* Right Column - Payment Input Fields */}
              <div className="lg:col-span-3 bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                <form onSubmit={handlePaymentSubmit(handleRecordPayment, (errors) => {
                  console.log("Form validation errors:", errors);
                  if (Object.keys(errors).length > 0) {
                    setToast({ 
                      show: true, 
                      type: "error", 
                      message: "Please fix the form errors before submitting" 
                    });
                  }
                })} className="space-y-4">
                  <FormInput
                    label="Paid Amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="₹ 0"
                    register={registerPayment}
                    errors={paymentErrors}
                    {...registerPayment("amount", {
                      required: "Payment amount is required",
                      validate: (value) => {
                        // Handle both string and number inputs
                        const numValue = typeof value === "string" ? parseFloat(value) : value;
                        if (!value || value === "" || isNaN(numValue)) {
                          return "Payment amount is required";
                        }
                        if (numValue <= 0) {
                          return "Payment amount must be greater than 0";
                        }
                        return true;
                      },
                    })}
                  />
                  <FormInput
                    label="Discount"
                    name="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="₹ Discount"
                    register={registerPayment}
                    errors={paymentErrors}
                    {...registerPayment("discount", {
                      validate: (value) => {
                        // Allow empty, 0, or valid numbers
                        if (value === "" || value === null || value === undefined || value === "0" || value === 0) {
                          return true;
                        }
                        const numValue = typeof value === "string" ? parseFloat(value) : value;
                        if (isNaN(numValue)) {
                          return true; // Invalid number defaults to 0
                        }
                        if (numValue < 0) {
                          return "Discount cannot be negative";
                        }
                        return true;
                      },
                    })}
                  />
                  <FormSelect
                    label="Mode"
                    name="method"
                    register={registerPayment}
                    errors={paymentErrors}
                    options={["CASH", "UPI", "BHIM", "PhonePe", "CARD"]}
                    {...registerPayment("method", {
                      required: "Payment method is required",
                    })}
                  />
                  <DateTimePicker
                    label="Record Time"
                    name="recordTime"
                    register={registerPayment}
                    errors={paymentErrors}
                    required={true}
                  />
                  <FormTextarea
                    label="Comment"
                    name="comments"
                    rows={4}
                    placeholder=""
                    register={registerPayment}
                    errors={paymentErrors}
                    {...registerPayment("comments")}
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Total Payment
                      </label>
                      <div className="text-lg font-semibold text-gray-900">
                        ₹ {calculateTotalPayment().toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        New Balance
                      </label>
                      <div className="text-lg font-semibold text-gray-900">
                        ₹ {calculateNewBalance().toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mt-4"
                  >
                    <Send className="w-4 h-4" />
                    Record
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case "renew":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Renew</h2>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500">Customer :</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">
                      {currentCustomer.fullName}
                      {currentCustomer.customerCode
                        ? ` (${currentCustomer.customerCode})`
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500">Current Balance :</span>
                    <span className="inline-block px-3 py-1 bg-gray-800 text-white rounded-full text-sm font-medium ml-2">
                      ₹ {balance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500">Last Bill Date :</span>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-sm font-medium text-gray-900">{lastBillDate}</span>
                      <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleRenewSubmit(handleRenew)} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 block">
                      Date
                    </label>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 relative">
                        <DatePicker
                          name="fromDate"
                          register={registerRenew}
                          errors={renewErrors}
                          placeholder="From Date"
                        />
                      </div>
                      <span className="text-gray-600 font-medium pt-2">To</span>
                      <div className="flex-1 relative">
                        <DatePicker
                          name="toDate"
                          register={registerRenew}
                          errors={renewErrors}
                          placeholder="To Date"
                        />
                      </div>
                    </div>
                    {(renewErrors.fromDate || renewErrors.toDate) && (
                      <p className="mt-1 text-sm text-red-600">
                        {renewErrors.fromDate?.message || renewErrors.toDate?.message}
                      </p>
                    )}
                  </div>
                  <FormSelect
                    label="Period"
                    name="period"
                    register={registerRenew}
                    errors={renewErrors}
                    options={["1 Months", "2 Months", "3 Months", "6 Months", "12 Months"]}
                    {...registerRenew("period")}
                  />
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Renew
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const period = watchRenew("period") || "1 Months";
                        const dates = calculateRenewDatesFromToday(period);
                        setRenewValue("fromDate", dates.fromDate);
                        setRenewValue("toDate", dates.toDate);
                        setRenewValue("period", period);
                        handleRenewFromToday();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Renew From Today
                    </button>
                    <button 
                      type="button"
                      onClick={handleOpenPlanPopup}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Change Subscription
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Current Subscription ({selectedPlans.length > 0 
                    ? selectedPlans.length 
                    : (currentCustomer.subscriptions?.length || (currentCustomer.subscription ? 1 : 0))})
                </h3>
                {selectedPlans.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPlans.map((plan, index) => (
                      <div key={plan.id || index} className="text-gray-900">
                        {index + 1}. {plan.name}
                      </div>
                    ))}
                  </div>
                ) : currentCustomer.subscriptions && currentCustomer.subscriptions.length > 0 ? (
                  <div className="space-y-2">
                    {currentCustomer.subscriptions.map((sub, index) => (
                      <div key={sub.id || index} className="text-gray-900">
                        {index + 1}. {sub.plan?.name || "N/A"}
                      </div>
                    ))}
                  </div>
                ) : currentCustomer.subscription ? (
                  <div className="space-y-2">
                    <div className="text-gray-900">
                      1. {currentCustomer.subscription.plan?.name || "N/A"}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No subscription found</p>
                )}
              </div>
            </div>
          </div>
        );

      case "subscription":
        const subscriptions = currentCustomer.subscriptions || (currentCustomer.subscription ? [currentCustomer.subscription] : []);
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Current Subscription ({subscriptions.length})
            </h2>
            {subscriptions.length > 0 ? (
              <div className="space-y-4">
                {subscriptions.map((sub, index) => (
                  <div key={sub.id || index} className="text-gray-900">
                    {index + 1}. {sub.plan?.name || "N/A"}
                  </div>
                ))}
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={handleOpenPlanPopup}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Change Subscription
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-500">No subscription found</p>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={handleOpenPlanPopup}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Add Subscription
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case "add-on-bill":
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add On Bill</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Current Balance
                  </h3>
                  <div className="text-2xl font-bold text-gray-900">
                    ₹ {balance.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <form onSubmit={handleAddOnSubmit(handleAddOnBill)} className="space-y-4">
                  <FormInput
                    label="Item Name"
                    name="itemName"
                    type="text"
                    placeholder="Item"
                    register={registerAddOn}
                    errors={addOnErrors}
                    {...registerAddOn("itemName", {
                      required: "Item name is required",
                    })}
                  />
                  <FormInput
                    label="Price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Price"
                    register={registerAddOn}
                    errors={addOnErrors}
                    {...registerAddOn("price", {
                      required: "Price is required",
                      min: {
                        value: 0.01,
                        message: "Price must be greater than 0",
                      },
                      valueAsNumber: true,
                    })}
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      New Balance
                    </label>
                    <div className="px-3 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium border border-gray-200">
                      ₹ {calculateNewBalanceForAddOn().toFixed(2)}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Send className="w-4 h-4" />
                    Update
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case "adjust-balance":
        const watchedNewBalance = watchAdjust("newBalance");
        const adjustmentAmount = watchedNewBalance
          ? parseFloat(watchedNewBalance) - balance
          : 0;
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Adjust Balance</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Current Balance
                  </h3>
                  <div className="text-2xl font-bold text-gray-900">
                    ₹ {balance.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <form onSubmit={handleAdjustSubmit(handleAdjustBalance)} className="space-y-4">
                  <FormInput
                    label="New Balance"
                    name="newBalance"
                    type="number"
                    step="0.01"
                    placeholder="New Balance"
                    register={registerAdjust}
                    errors={adjustErrors}
                    {...registerAdjust("newBalance", {
                      required: "New balance is required",
                      valueAsNumber: true,
                    })}
                  />
                  <FormTextarea
                    label="Enter Reason of Change"
                    name="reason"
                    rows={4}
                    placeholder="Enter reason for balance adjustment..."
                    register={registerAdjust}
                    errors={adjustErrors}
                    {...registerAdjust("reason")}
                  />
                  {watchedNewBalance && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Adjustment Amount
                      </label>
                      <div className={`px-3 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium border border-gray-200 ${
                        adjustmentAmount < 0 ? "text-red-600" : adjustmentAmount > 0 ? "text-green-600" : ""
                      }`}>
                        {adjustmentAmount < 0 ? "-" : adjustmentAmount > 0 ? "+" : ""} ₹ {Math.abs(adjustmentAmount).toFixed(2)}
                      </div>
                    </div>
                  )}
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                  >
                    <Send className="w-4 h-4" />
                    Update
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case "balance-history":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Balance History</h2>
              <button
                onClick={() => {
                  // TODO: Implement download
                  console.log("Download balance history");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
            {balanceHistory.loading ? (
              <div className="p-6 text-center">
                <Spinner loadingTxt="Loading balance history..." size="medium" />
              </div>
            ) : balanceHistory.error ? (
              <div className="p-6 text-center text-red-600">{balanceHistory.error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        DATE
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        TRANSACTION AMOUNT
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        FINAL
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {balanceHistory.transactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      balanceHistory.transactions.map((transaction, index) => {
                        const isPayment = transaction.type === "PAYMENT";
                        const isBill = transaction.type === "INVOICE";
                        const isAdjustment = transaction.type === "BALANCE_ADJUSTMENT";
                        const isAddOn = transaction.type === "ADD_ON_BILL";
                        // For adjustments, calculate the actual change amount
                        const amount = isAdjustment || isAddOn
                          ? Math.abs((transaction.balanceAfter || 0) - (transaction.balanceBefore || 0))
                          : Math.abs(transaction.amount || 0);
                        const finalBalance = transaction.balanceAfter || 0;

                        const canDelete = canDeleteTransaction(transaction, index);
                        const isClickable = isBill || transaction.type === "PAYMENT" || isAdjustment || isAddOn;
                        
                        return (
                          <tr 
                            key={transaction.id} 
                            className={`hover:bg-gray-50 ${isClickable ? "cursor-pointer" : ""}`}
                            onClick={() => {
                              if (isClickable) {
                                handleRowClick(transaction);
                              }
                            }}
                          >
                            <td className="px-4 py-3 border-r border-gray-200">
                              {isPayment ? (
                                <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                                  <Banknote className="w-6 h-6 text-white" />
                                </div>
                              ) : isBill ? (
                                <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center">
                                  <Receipt className="w-6 h-6 text-white" />
                                </div>
                              ) : isAdjustment || isAddOn ? (
                                <div className="w-10 h-10 bg-gray-500 rounded flex items-center justify-center">
                                  <Hand className="w-6 h-6 text-white" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-gray-400 rounded"></div>
                              )}
                            </td>
                            <td className="px-4 py-3 border-r border-gray-200">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {isPayment
                                    ? `Payment On ${formatDateShort(transaction.transactionDate || transaction.createdAt)}`
                                    : isBill
                                    ? transaction.invoice?.periodStart && transaction.invoice?.periodEnd
                                      ? `Bill From ${formatDateShort(transaction.invoice.periodStart)} To ${formatDateShort(transaction.invoice.periodEnd)}`
                                      : `Invoice ${formatDateShort(transaction.transactionDate || transaction.createdAt)}`
                                    : isAdjustment
                                    ? transaction.description || "Balance Adjustment"
                                    : isAddOn
                                    ? transaction.description || "Add On Bill"
                                    : transaction.description || "Transaction"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {isPayment
                                    ? `Recorded On ${formatDateShort(transaction.transactionDate || transaction.createdAt)}`
                                    : isBill
                                    ? `Billed On ${formatDateShort(transaction.transactionDate || transaction.createdAt)}`
                                    : `Recorded On ${formatDateShort(transaction.transactionDate || transaction.createdAt)}`}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 border-r border-gray-200">
                              <span
                                className={`text-sm font-medium ${
                                  isPayment || (transaction.direction === "CREDIT") ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {isPayment || (transaction.direction === "CREDIT") ? "(-)" : "(+)"} ₹ {amount.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-4 py-3 border-r border-gray-200">
                              {finalBalance === 0 ? (
                                <span className="text-sm text-gray-600">₹ 0</span>
                              ) : finalBalance > 0 ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    ₹ {finalBalance.toFixed(2)}
                                  </span>
                                  <span className="text-xs text-green-600">Due</span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-600">
                                  ₹ {Math.abs(finalBalance).toFixed(2)}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              {canDelete && (
                                <button
                                  onClick={(e) => {
                                    if (isPayment && transaction.referenceType === "payment" && transaction.referenceId) {
                                      // If referenceType is payment, referenceId is the payment ID
                                      handleDeletePayment(transaction.referenceId, e);
                                    } else if (isPayment && transaction.referenceId) {
                                      // For payment transactions linked to invoice, we need to delete the transaction
                                      // The actual payment deletion would require finding the payment by invoiceId
                                      handleDeleteTransaction(transaction.id, e);
                                    } else {
                                      handleDeleteTransaction(transaction.id, e);
                                    }
                                  }}
                                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "customer-edit":
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">General Detail</h2>
            <div className="space-y-4 max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Customer Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    defaultValue={currentCustomer.fullName || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Customer Billing Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    defaultValue={currentCustomer.billingName || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Billing Area :
                  </label>
                  <input
                    type="text"
                    defaultValue={currentCustomer.area?.areaName || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Billing No :
                  </label>
                  <input
                    type="text"
                    defaultValue={currentCustomer.customerCode || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    GST No :
                  </label>
                  <input
                    type="text"
                    defaultValue={currentCustomer.gstNumber || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Mobile Number 1:
                  </label>
                  <input
                    type="text"
                    defaultValue={currentCustomer.phone || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Mobile Number 2 :
                  </label>
                  <input
                    type="text"
                    defaultValue={currentCustomer.phoneSecondary || "0"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Email :
                  </label>
                  <input
                    type="email"
                    defaultValue={currentCustomer.email || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Address :
                  </label>
                  <textarea
                    defaultValue={currentCustomer.address || ""}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Security Deposit:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={currentCustomer.securityDeposit || 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Customer Code:
                  </label>
                  <input
                    type="text"
                    defaultValue={currentCustomer.customerCode || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Remark:
                  </label>
                  <textarea
                    defaultValue={currentCustomer.remarks || ""}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Latitude:
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    defaultValue={currentCustomer.latitude || 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Longitude:
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    defaultValue={currentCustomer.longitude || 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => navigate(`/customers/${id}/edit`)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );

      case "hardware-details":
        const handleHardwareChange = (field, value) => {
          setHardwareForm(prev => ({ ...prev, [field]: value }));
        };

        const handleSaveHardware = async () => {
          try {
            await updateCustomer(id, {
              hardware: hardwareForm,
            });
            setToast({
              show: true,
              type: "success",
              message: "Hardware details updated successfully",
            });
            await fetchCustomerById(id);
          } catch (error) {
            console.error("Failed to update hardware:", error);
            setToast({
              show: true,
              type: "error",
              message: error.response?.data?.message || "Failed to update hardware details",
            });
          }
        };

        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Hardware Details
            </h2>
            {currentCustomer.hardware ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Device Type
                    </label>
                    <input
                      type="text"
                      value={hardwareForm.deviceType}
                      onChange={(e) => handleHardwareChange("deviceType", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      MAC Address
                    </label>
                    <input
                      type="text"
                      value={hardwareForm.macAddress}
                      onChange={(e) => handleHardwareChange("macAddress", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      IP Address
                    </label>
                    <input
                      type="text"
                      value={hardwareForm.ipAddress}
                      onChange={(e) => handleHardwareChange("ipAddress", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    onClick={() => {
                      setHardwareForm({
                        deviceType: currentCustomer?.hardware?.deviceType || "",
                        macAddress: currentCustomer?.hardware?.macAddress || "",
                        ipAddress: currentCustomer?.hardware?.ipAddress || "",
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveHardware}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No hardware information found</p>
                <button 
                  onClick={async () => {
                    try {
                      await updateCustomer(id, {
                        hardware: {
                          deviceType: "",
                          macAddress: "",
                          ipAddress: "",
                        },
                      });
                      await fetchCustomerById(id);
                    } catch (error) {
                      console.error("Failed to add hardware:", error);
                      setToast({
                        show: true,
                        type: "error",
                        message: error.response?.data?.message || "Failed to add hardware details",
                      });
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Hardware Details
                </button>
              </div>
            )}
          </div>
        );

      case "customer-follow-up":
        const handleScheduleFollowUp = async () => {
          try {
            await updateCustomer(id, {
              customer: {
                followUpDate,
                followUpNotes,
              },
            });
            setToast({
              show: true,
              type: "success",
              message: "Follow up scheduled successfully",
            });
            await fetchCustomerById(id);
            // Navigate to customers page with follow up filter
            navigate("/customers?followUpStatus=today");
          } catch (error) {
            console.error("Failed to schedule follow up:", error);
            setToast({
              show: true,
              type: "error",
              message: error.response?.data?.message || "Failed to schedule follow up",
            });
          }
        };

        const handleRemoveFollowUp = async () => {
          try {
            await updateCustomer(id, {
              customer: {
                followUpDate: null,
                followUpNotes: null,
              },
            });
            setToast({
              show: true,
              type: "success",
              message: "Follow up removed successfully",
            });
            setFollowUpDate(new Date().toISOString().split("T")[0]);
            setFollowUpNotes("");
            await fetchCustomerById(id);
          } catch (error) {
            console.error("Failed to remove follow up:", error);
            setToast({
              show: true,
              type: "error",
              message: error.response?.data?.message || "Failed to remove follow up",
            });
          }
        };

        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Customer Follow Up
            </h2>
            <div className="space-y-4">
              <div>
                <DatePicker
                  label="Follow Up Date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Notes
                </label>
                <textarea
                  rows="4"
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter follow-up notes..."
                />
              </div>
              <div className="flex gap-3">
                {currentCustomer?.followUpDate && (
                  <button 
                    onClick={handleRemoveFollowUp}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Follow Up
                  </button>
                )}
                <button 
                  onClick={handleScheduleFollowUp}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Send className="w-4 h-4" />
                  Schedule Follow Up
                </button>
              </div>
            </div>
          </div>
        );

      case "upload-documents":
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Upload Documents
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Document Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select document type</option>
                  <option value="id-proof">ID Proof</option>
                  <option value="address-proof">Address Proof</option>
                  <option value="agreement">Agreement</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Upload File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, PNG, JPG up to 10MB
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    id="document-upload"
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                  <label
                    htmlFor="document-upload"
                    className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Description
                </label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter document description..."
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {menuItems.find((item) => item.id === activeSection)?.label ||
                "Section"}
            </h2>
            <p className="text-gray-500">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/customers")}
          className="p-2 rounded-lg text-white shadow-md bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 transition-transform hover:scale-[1.02] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-bold text-gray-900">
            {currentCustomer?.fullName || "Customer Details"}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              {currentCustomer?.isActive ? "Active" : "Inactive"}
            </span>
            <button
              onClick={() => handleToggleActiveStatus(!currentCustomer?.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                currentCustomer?.isActive ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  currentCustomer?.isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-sm font-medium text-gray-500 mb-1">
            Balance Amount
          </div>
          <div className="text-xl font-bold text-gray-900">₹{balance.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-sm font-medium text-gray-500 mb-1">
            Last Bill Date
          </div>
          <div className="text-xl font-bold text-gray-900">{lastBillDate}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-sm font-medium text-gray-500 mb-1">
            Billing Area
          </div>
          <div className="text-xl font-bold text-gray-900">
            {currentCustomer.area?.areaName || "N/A"}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-sm font-medium text-gray-500 mb-1">Mobile No.</div>
          <div className="text-xl font-bold text-gray-900">
            {currentCustomer.phone || "N/A"}
          </div>
        </div>
      </div>

      {/* Hardware Details */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Hardware Details
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  ROUTER
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  IP
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  MAC
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  MEMBERSHIP NO
                </th>
              </tr>
            </thead>
            <tbody>
              {currentCustomer.hardware ? (
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3 border-r border-gray-200">
                    {currentCustomer.hardware.deviceType || "-"}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    {currentCustomer.hardware.ipAddress || "-"}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    {currentCustomer.hardware.macAddress || "-"}
                  </td>
                  <td className="px-4 py-3">{currentCustomer.customerCode || "-"}</td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                    No hardware information found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3
              className={`text-lg font-semibold mb-4 ${
                activeSection === "collect-payment"
                  ? "text-blue-600"
                  : "text-gray-900"
              }`}
            >
              {menuItems.find((item) => item.id === activeSection)?.label ||
                "Menu"}
            </h3>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">{renderMainContent()}</div>
      </div>

      {/* Invoice Preview Modal */}
      {showInvoicePreview && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedInvoice.type === "BALANCE_ADJUSTMENT" 
                  ? "Adjusted Balance" 
                  : `Invoice Preview - Bill #${selectedInvoice.id}`}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // TODO: Implement print functionality
                    window.print();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Print
                </button>
                <button
                  onClick={() => {
                    setShowInvoicePreview(false);
                    setSelectedInvoice(null);
                    setInvoiceDetails(null);
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
              {selectedInvoice.type === "BALANCE_ADJUSTMENT" ? (
                // Balance Adjustment Preview
                <div className="bg-white p-8 border border-gray-200">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Adjusted Balance</h1>
                  </div>
                  <div className="mb-6">
                    <p className="text-lg font-medium text-gray-700">
                      <strong>Date:</strong> {formatDate(selectedInvoice.transactionDate || selectedInvoice.recordedDate || selectedInvoice.createdAt)}
                    </p>
                  </div>
                  <div className="flex justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">From</h2>
                      <div className="space-y-2">
                        <p><strong>Name:</strong> Srishti Broadband</p>
                        <p><strong>Address:</strong> Near Railway Gate, Voleti Complex, Above HDFC ATM, Katcheri Street, Sullurpeta, Andhra Pradesh-524121</p>
                        <p><strong>Phone:</strong> 7036972285</p>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">To</h2>
                      <div className="space-y-2">
                        <p><strong>Name:</strong> {selectedInvoice.Customer?.fullName || "N/A"}</p>
                        <p><strong>Service/Company:</strong> srishti broadband</p>
                        <p><strong>Customer Code:</strong> {selectedInvoice.Customer?.customerCode || "N/A"}</p>
                        <p><strong>Phone:</strong> {selectedInvoice.Customer?.phone || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hardware Detail</h3>
                    <p className="text-gray-500">-</p>
                  </div>
                  <div className="mb-8">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left">Details</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">
                            {selectedInvoice.referenceType === "add_on_bill" 
                              ? selectedInvoice.description?.split(" - ")[1] || selectedInvoice.description || "Add On Bill"
                              : selectedInvoice.description?.split(" - ")[1] || selectedInvoice.description || "Balance Adjustment"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            ₹ {(selectedInvoice.balanceAfter - selectedInvoice.balanceBefore).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-4">Summary of Balances</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Prev Balance:</span>
                          <span>₹ {selectedInvoice.balanceBefore.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Grand Total:</span>
                          <span>₹ {selectedInvoice.balanceAfter.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-gray-600 text-sm mb-8">
                    <p>This is a computer generated receipt it does not require any signature/stamp</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">www.hix42.com</p>
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      b
                    </div>
                  </div>
                </div>
              ) : invoiceDetails ? (
                // Invoice Preview
                <div className="bg-white p-8 border border-gray-200">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice</h1>
                  </div>
                  <div className="flex justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">INVOICE</h2>
                      <div className="space-y-2">
                        <p><strong>Bill No:</strong> {invoiceDetails.id}</p>
                        <p><strong>Customer:</strong> {invoiceDetails.Customer?.fullName || "N/A"}</p>
                        <p><strong>Customer Code:</strong> {invoiceDetails.Customer?.customerCode || "N/A"}</p>
                        <p><strong>Area:</strong> {invoiceDetails.Customer?.Area?.areaName || "N/A"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="space-y-2">
                        <p><strong>Bill From:</strong> {formatDate(invoiceDetails.periodStart)}</p>
                        <p><strong>Bill To:</strong> {formatDate(invoiceDetails.periodEnd)}</p>
                        <p><strong>Billed On:</strong> {formatDate(invoiceDetails.createdAt)}</p>
                        <p><strong>Due Date:</strong> {formatDate(invoiceDetails.dueDate)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-8">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceDetails.InvoiceItems?.map((item, idx) => (
                          <tr key={idx}>
                            <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">₹ {item.totalAmount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mb-8">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span>Sub Total:</span>
                        <span>₹ {invoiceDetails.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>₹ {invoiceDetails.taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>₹ {invoiceDetails.amountTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Payment Status</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p><strong>Total Paid:</strong> ₹ {invoiceDetails.totalPaid?.toFixed(2) || "0.00"}</p>
                          <p><strong>Balance:</strong> ₹ {invoiceDetails.balance?.toFixed(2) || "0.00"}</p>
                        </div>
                        <div>
                          <p><strong>Status:</strong> {invoiceDetails.status}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Spinner loadingTxt="Loading details..." size="medium" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Preview Modal */}
      {showPaymentPreview && selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment Receipt - #{selectedPayment.id}
              </h3>
              <button
                onClick={() => {
                  setShowPaymentPreview(false);
                  setSelectedPayment(null);
                  setSelectedPaymentDetails(null);
                }}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
              {selectedPaymentDetails ? (
                <div className="bg-white p-8 border border-gray-200">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Receipt</h1>
                  </div>
                  <div className="mb-8">
                    <div className="space-y-2">
                      <p><strong>Receipt No:</strong> {selectedPaymentDetails.id}</p>
                      <p><strong>Customer:</strong> {selectedPaymentDetails.Invoice?.Customer?.fullName || "N/A"}</p>
                      <p><strong>Customer Code:</strong> {selectedPaymentDetails.Invoice?.Customer?.customerCode || "N/A"}</p>
                      <p><strong>Area:</strong> {selectedPaymentDetails.Invoice?.Customer?.Area?.areaName || "N/A"}</p>
                      <p><strong>Payment Date:</strong> {formatDate(selectedPaymentDetails.collectedAt)}</p>
                      <p><strong>Payment Method:</strong> {selectedPaymentDetails.method}</p>
                      {selectedPaymentDetails.collector && (
                        <p><strong>Collected By:</strong> {selectedPaymentDetails.collector.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="mb-8">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg">Amount Paid:</span>
                          <span className="text-2xl font-bold text-green-600">₹ {selectedPaymentDetails.amount.toFixed(2)}</span>
                        </div>
                        {selectedPaymentDetails.comments && (
                          <div className="border-t pt-3">
                            <p className="text-sm text-gray-600">
                              <strong>Comments:</strong> {selectedPaymentDetails.comments}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Spinner loadingTxt="Loading payment details..." size="medium" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ show: false, type: "success", message: "" })}
        />
      )}

      {/* Plan Selection Popup */}
      {showPlanPopup && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Subscription</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">FROM :</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentCustomer?.latestInvoice?.periodEnd 
                      ? new Date(currentCustomer.latestInvoice.periodEnd).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                  <span className="text-sm text-gray-500">TO :</span>
                  <span className="text-sm font-medium text-gray-900">FOREVER</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPlanPopup(false);
                  setSearchPlanQuery("");
                  setSelectedPlans([]);
                  setFixedBillAmount("");
                  setActiveTab("plans");
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Plans */}
            {selectedPlans.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">Already ({selectedPlans.length})</span>
                  {selectedPlans.map((plan) => (
                    <span
                      key={plan.id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {plan.name} ₹{plan.monthlyPrice?.toFixed(2) || "0.00"} ({selectedPlans.filter(p => p.id === plan.id).length}) x
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6">
              <button
                onClick={() => setActiveTab("plans")}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "plans"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                SELECT PLANS
              </button>
              <button
                onClick={() => setActiveTab("fixed")}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "fixed"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                FIXED BILL AMOUNT
              </button>
            </div>

            {/* Content based on active tab */}
            {activeTab === "plans" ? (
              <>
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Search for..."
                        value={searchPlanQuery}
                        onChange={(e) => setSearchPlanQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
                      <Search className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSearchPlanQuery("")}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Plans List */}
                <div className="flex-1 overflow-y-auto p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">S.No</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Price</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans
                        .filter((plan) =>
                          plan.name?.toLowerCase().includes(searchPlanQuery.toLowerCase()) ||
                          plan.code?.toLowerCase().includes(searchPlanQuery.toLowerCase())
                        )
                        .map((plan, index) => {
                          const isSelected = selectedPlans.some((p) => p.id === plan.id);
                          const quantity = selectedPlans.filter((p) => p.id === plan.id).length;
                          return (
                            <tr key={plan.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-900">{plan.id || index + 1}</td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-900">{plan.name}</span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-900">
                                ₹{plan.monthlyPrice?.toFixed(2) || "0.00"}
                              </td>
                              <td className="py-3 px-4">
                                <input
                                  type="number"
                                  min="1"
                                  defaultValue={quantity || 1}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSelectPlan(plan)}
                                    className={`px-4 py-1 rounded text-sm transition-colors ${
                                      isSelected
                                        ? "bg-green-600 text-white hover:bg-green-700"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                  >
                                    {isSelected ? "Added" : "Add"}
                                  </button>
                                  {isSelected && (
                                    <button
                                      onClick={() => handleSelectPlan(plan)}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                      title="Remove plan"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              /* Fixed Bill Amount Tab */
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                  <div className="text-4xl font-bold text-red-600 mb-8">OR</div>
                  <div className="w-full max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ENTER FIXED BILL AMOUNT (Example rs 300 / month)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
                      value={fixedBillAmount}
                      onChange={(e) => setFixedBillAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-semibold text-gray-900">
                    ₹ {activeTab === "fixed" 
                      ? parseFloat(fixedBillAmount || 0).toFixed(2)
                      : selectedPlans.reduce((sum, plan) => sum + (plan.monthlyPrice || 0), 0).toFixed(2)
                    }
                  </div>
                  <button
                    onClick={() => {
                      // Get dates from renew form
                      const fromDate = watchRenew("fromDate");
                      const toDate = watchRenew("toDate");
                      if (fromDate && toDate) {
                        setShowPlanPopup(false);
                        openGenerateBillModal(fromDate, toDate);
                      } else {
                        setToast({
                          show: true,
                          type: "error",
                          message: "Please select dates in the Renew section first",
                        });
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Bill Modal */}
      {showGenerateBillModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Generate Bill</h2>
              <button
                onClick={() => {
                  setShowGenerateBillModal(false);
                  setEditingItemIndex(null);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Invoice Info */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Invoice Date: </span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date().toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Bill To: </span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentCustomer?.fullName || "N/A"}
                    {currentCustomer?.customerCode ? ` (${currentCustomer.customerCode})` : ""}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Phone: </span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentCustomer?.phone || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Date: </span>
                  <span className="text-sm font-medium text-gray-900">
                    {billPeriodStart && billPeriodEnd
                      ? `${new Date(billPeriodStart).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })} to ${new Date(billPeriodEnd).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}`
                      : "N/A"}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">S.No.</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Item</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">HSN Code</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Gst</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billItems.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-900">{index + 1}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {editingItemIndex !== null ? (
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => {
                                const updated = [...billItems];
                                updated[index].name = e.target.value;
                                setBillItems(updated);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            item.name
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {editingItemIndex !== null ? (
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const updated = [...billItems];
                                updated[index].quantity = parseFloat(e.target.value) || 1;
                                updated[index].totalAmount = updated[index].unitPrice * updated[index].quantity;
                                setBillItems(updated);
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            item.quantity
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">-</td>
                        <td className="py-3 px-4 text-sm text-gray-900">₹ 0</td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {editingItemIndex !== null ? (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => {
                                const updated = [...billItems];
                                updated[index].unitPrice = parseFloat(e.target.value) || 0;
                                updated[index].totalAmount = updated[index].unitPrice * updated[index].quantity;
                                setBillItems(updated);
                              }}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            `₹ ${item.totalAmount.toFixed(2)}`
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {editingItemIndex !== null && (
                            <button
                              onClick={() => {
                                const updated = billItems.filter((_, i) => i !== index);
                                setBillItems(updated);
                              }}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Product Subtotal:</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹ {billItems.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Additional:</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={additionalAmount}
                    onChange={(e) => setAdditionalAmount(parseFloat(e.target.value) || 0)}
                    className="w-32 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Prev Balance:</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹ {balance.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-lg font-bold text-gray-900">Grand Total:</span>
                  <span className="text-lg font-bold text-gray-900">
                    ₹ {(
                      billItems.reduce((sum, item) => sum + item.totalAmount, 0) +
                      additionalAmount +
                      balance
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={async () => {
                  try {
                    const subtotal = billItems.reduce((sum, item) => sum + item.totalAmount, 0);
                    const amountTotal = subtotal + additionalAmount + balance;
                    
                    const billData = {
                      periodStart: billPeriodStart,
                      periodEnd: billPeriodEnd,
                      items: billItems,
                      subtotal,
                      additionalAmount,
                      prevBalance: balance,
                      amountTotal,
                      collectPayment: false, // Don't collect payment yet, we'll open the payment form
                      subscriptions: selectedPlans.map((plan) => ({
                        planId: plan.id,
                        monthlyPrice: plan.monthlyPrice,
                      })),
                    };
                    
                    const response = await generateBill(id, billData);
                    if (response.success) {
                      setShowGenerateBillModal(false);
                      setEditingItemIndex(null);
                      // Open collect payment section and autofill amount
                      setActiveSection("collect-payment");
                      resetPayment({
                        amount: amountTotal.toFixed(2),
                        discount: 0,
                        method: "CASH",
                        recordTime: getCurrentDateTime(),
                        comments: "",
                      });
                      setToast({
                        show: true,
                        type: "success",
                        message: "Bill generated. Please collect payment.",
                      });
                      await loadBalanceHistory();
                      await loadPaymentDetails();
                      await fetchCustomerById(id);
                    }
                  } catch (error) {
                    setToast({
                      show: true,
                      type: "error",
                      message: error.response?.data?.message || "Failed to generate bill",
                    });
                  }
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Generate Bill & Collect Payment
              </button>
              <button
                onClick={async () => {
                  try {
                    const subtotal = billItems.reduce((sum, item) => sum + item.totalAmount, 0);
                    const amountTotal = subtotal + additionalAmount + balance;
                    
                    const billData = {
                      periodStart: billPeriodStart,
                      periodEnd: billPeriodEnd,
                      items: billItems,
                      subtotal,
                      additionalAmount,
                      prevBalance: balance,
                      amountTotal,
                      collectPayment: false,
                      subscriptions: selectedPlans.map((plan) => ({
                        planId: plan.id,
                        monthlyPrice: plan.monthlyPrice,
                      })),
                    };
                    
                    const response = await generateBill(id, billData);
                    if (response.success) {
                      setToast({
                        show: true,
                        type: "success",
                        message: "Bill generated successfully",
                      });
                      setShowGenerateBillModal(false);
                      setEditingItemIndex(null);
                      await loadBalanceHistory();
                      await loadPaymentDetails();
                      await fetchCustomerById(id);
                    }
                  } catch (error) {
                    setToast({
                      show: true,
                      type: "error",
                      message: error.response?.data?.message || "Failed to generate bill",
                    });
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate Bill
              </button>
              <button
                onClick={async () => {
                  try {
                    const subtotal = billItems.reduce((sum, item) => sum + item.totalAmount, 0);
                    const amountTotal = subtotal + additionalAmount + balance;
                    
                    const billData = {
                      periodStart: billPeriodStart,
                      periodEnd: billPeriodEnd,
                      items: billItems,
                      subtotal,
                      additionalAmount,
                      prevBalance: balance,
                      amountTotal,
                      collectPayment: false,
                      subscriptions: selectedPlans.map((plan) => ({
                        planId: plan.id,
                        monthlyPrice: plan.monthlyPrice,
                      })),
                    };
                    
                    const response = await generateBill(id, billData);
                    if (response.success) {
                      setShowGenerateBillModal(false);
                      setEditingItemIndex(null);
                      setGeneratedInvoiceId(response.data.invoice.id);
                      // Open invoice preview
                      try {
                        const invoiceResponse = await axiosInstance.get(`/customers/invoices/${response.data.invoice.id}`);
                        if (invoiceResponse.data.success) {
                          setInvoiceDetails(invoiceResponse.data.data);
                          setSelectedInvoice(invoiceResponse.data.data);
                          setShowInvoicePreview(true);
                        }
                      } catch (error) {
                        console.error("Failed to load invoice details:", error);
                      }
                      await loadBalanceHistory();
                      await loadPaymentDetails();
                      await fetchCustomerById(id);
                    }
                  } catch (error) {
                    setToast({
                      show: true,
                      type: "error",
                      message: error.response?.data?.message || "Failed to generate bill",
                    });
                  }
                }}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Generate Bill & View
              </button>
              <button
                onClick={() => {
                  if (editingItemIndex === null) {
                    // Enable edit mode for all items
                    setEditingItemIndex(0);
                  } else {
                    // Disable edit mode
                    setEditingItemIndex(null);
                  }
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  editingItemIndex !== null
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {editingItemIndex !== null ? "Save All" : "Edit Bill"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Alert */}
      <ConfirmAlert
        show={confirmAlert.show}
        title={confirmAlert.title}
        message={confirmAlert.message}
        onConfirm={confirmAlert.onConfirm}
        onCancel={() => setConfirmAlert({ ...confirmAlert, show: false })}
        type={confirmAlert.type}
      />
    </Layout>
  );
};

export default CustomerDetail;
