import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useCompanyStore from "../store/companyStore";
import useAdminStore from "../store/adminStore";
import useUserStore from "../store/userStore";
import { logout } from "../api/authApi";
import Spinner from "../components/Spinner";
import {
  Plus,
  Edit,
  Eye,
  EyeOff,
  RefreshCw,
  Users,
  Building2,
  ToggleLeft,
  ToggleRight,
  Search,
  LogOut,
} from "lucide-react";

// Super Admin Dashboard
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { clearUser } = useUserStore();
  
  const {
    companies,
    loading: companyLoading,
    error: companyError,
    fetchCompanies,
    createCompany, // <-- assumed in store
    updateCompany, // <-- assumed in store
  } = useCompanyStore();

  const {
    admins,
    fetchAdmins,
    createAdmin,
    updateAdmin,
    resetAdminPassword,
  } = useAdminStore();

  const [expandedCompany, setExpandedCompany] = useState(null);

  // Admin modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminModalData, setAdminModalData] = useState({}); // {mode, companyId, admin}
  const [adminModalLoading, setAdminModalLoading] = useState(false);
  const [adminModalError, setAdminModalError] = useState("");

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalData, setPasswordModalData] = useState({});
  const [passwordModalLoading, setPasswordModalLoading] = useState(false);
  const [passwordModalError, setPasswordModalError] = useState("");

  // Company modal
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyModalData, setCompanyModalData] = useState({ mode: "create", company: null });
  const [companyModalLoading, setCompanyModalLoading] = useState(false);
  const [companyModalError, setCompanyModalError] = useState("");

  const [adminSearch, setAdminSearch] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshCompanies = () => {
    fetchCompanies();
    if (expandedCompany) fetchAdmins(expandedCompany);
  };

  const handleLogout = () => {
    logout();
    clearUser();
    navigate("/login", { replace: true });
  };

  // Expand company row to show admins
  const handleExpand = (companyId) => {
    const next = expandedCompany === companyId ? null : companyId;
    setExpandedCompany(next);
    if (next && !admins[next]) fetchAdmins(next);
  };

  // Open admin modal (create/edit)
  const openAdminModal = (mode, companyId, admin = null) => {
    setAdminModalData({ mode, companyId, admin });
    setShowAdminModal(true);
  };

  // Open company modal (create/edit)
  const openCompanyModal = (mode, company = null) => {
    setCompanyModalData({ mode, company });
    setShowCompanyModal(true);
  };

  // Handle admin create/edit
  const handleAdminSubmit = async (data) => {
    setAdminModalError("");
    setAdminModalLoading(true);
    try {
      if (adminModalData.mode === "create") {
        await createAdmin(adminModalData.companyId, data);
        await fetchAdmins(adminModalData.companyId);
      } else if (adminModalData.mode === "edit") {
        await updateAdmin(adminModalData.admin.id, adminModalData.companyId, data);
        await fetchAdmins(adminModalData.companyId);
      }
      setShowAdminModal(false);
    } catch (error) {
      setAdminModalError(
        error?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setAdminModalLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (data) => {
    setPasswordModalError("");
    setPasswordModalLoading(true);
    try {
      await resetAdminPassword(passwordModalData.admin.id, data.password, expandedCompany);
      setShowPasswordModal(false);
    } catch (error) {
      setPasswordModalError(
        error?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setPasswordModalLoading(false);
    }
  };

  const openPasswordModal = (admin) => {
    setPasswordModalData({ admin });
    setShowPasswordModal(true);
  };

  // Toggle active/inactive (active <-> suspended)
  const handleToggleActive = async (companyId, admin) => {
    const nextStatus = admin?.status === "active" ? "suspended" : "active";
    setTogglingId(admin.id);
    try {
      await updateAdmin(admin.id, companyId, { status: nextStatus });
      await fetchAdmins(companyId);
    } catch (error) {
      alert(
        error?.response?.data?.message || "Failed to update status. Please try again."
      );
    } finally {
      setTogglingId(null);
    }
  };

  // Handle company create/edit
  const handleCompanySubmit = async (data) => {
    setCompanyModalError("");
    setCompanyModalLoading(true);
    try {
      if (companyModalData.mode === "create") {
        await createCompany(data);
      } else if (companyModalData.mode === "edit") {
        await updateCompany(companyModalData.company.id, data);
      }
      await fetchCompanies();
      setShowCompanyModal(false);
    } catch (error) {
      setCompanyModalError(
        error?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setCompanyModalLoading(false);
    }
  };

  // Compute quick stats
  const stats = useMemo(() => {
    const totalCompanies = companies?.length || 0;
    const loadedCompanyId = expandedCompany;
    const loadedAdmins = loadedCompanyId ? admins[loadedCompanyId]?.data || [] : [];
    const activeCount = loadedAdmins.filter((a) => a.status === "active").length;
    return {
      totalCompanies,
      loadedAdminsCount: loadedAdmins.length,
      activeAdminsCount: activeCount,
    };
  }, [companies, admins, expandedCompany]);

  // Filter admins by quick search (name/phone/email)
  const filteredAdmins = useMemo(() => {
    if (!expandedCompany) return [];
    const list = admins[expandedCompany]?.data || [];
    if (!adminSearch.trim()) return list;
    const q = adminSearch.toLowerCase();
    return list.filter(
      (a) =>
        a?.name?.toLowerCase().includes(q) ||
        a?.phone?.toLowerCase().includes(q) ||
        a?.email?.toLowerCase().includes(q)
    );
  }, [admins, expandedCompany, adminSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 md:p-6 flex flex-col items-center">
      {/* Dashboard container */}
      <div className="w-full max-w-6xl space-y-6 mt-4 md:mt-8">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-4 md:p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Building2 className="w-9 h-9 text-indigo-600" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Super Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Manage companies and their admins at a glance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openCompanyModal("create")}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 active:scale-[0.98] transition"
                title="Add Company"
              >
                <Plus className="w-4 h-4" />
                Add Company
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-red-700 hover:bg-red-100 active:scale-[0.98] transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-4">
            <StatCard title="Companies" value={stats.totalCompanies} subtitle="Total registered" />
            <StatCard
              title="Admins (Shown)"
              value={stats.loadedAdminsCount}
              subtitle={expandedCompany ? "In selected company" : "Expand a company"}
            />
            <StatCard
              title="Active Admins"
              value={stats.activeAdminsCount}
              subtitle={expandedCompany ? "Currently active" : "Expand a company"}
            />
          </div>
        </div>

        {/* Companies & Admins */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6">
          {companyLoading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner loadingTxt="Loading companies..." />
            </div>
          ) : companyError ? (
            <p className="text-red-500 text-center">{companyError}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {companies.map((company) => (
                    <CompanyBlock
                      key={company.id}
                      company={company}
                      expandedCompany={expandedCompany}
                      onExpand={handleExpand}
                      onEditCompany={() => openCompanyModal("edit", company)}
                      admins={admins}
                      filteredAdmins={filteredAdmins}
                      adminSearch={adminSearch}
                      setAdminSearch={setAdminSearch}
                      openAdminModal={openAdminModal}
                      openPasswordModal={openPasswordModal}
                      togglingId={togglingId}
                      handleToggleActive={handleToggleActive}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Admin Modal (Create/Edit) */}
      {showAdminModal && (
        <AdminModal
          mode={adminModalData.mode}
          companyId={adminModalData.companyId}
          admin={adminModalData.admin}
          onClose={() => setShowAdminModal(false)}
          onSubmit={handleAdminSubmit}
          apiError={adminModalError}
          isLoading={adminModalLoading}
        />
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <PasswordModal
          admin={passwordModalData.admin}
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handlePasswordReset}
          apiError={passwordModalError}
          isLoading={passwordModalLoading}
        />
      )}

      {/* Company Modal */}
      {showCompanyModal && (
        <CompanyModal
          mode={companyModalData.mode}
          company={companyModalData.company}
          onClose={() => setShowCompanyModal(false)}
          onSubmit={handleCompanySubmit}
          apiError={companyModalError}
          isLoading={companyModalLoading}
        />
      )}
    </div>
  );
};

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
      }`}
      title={isActive ? "Active" : "Suspended"}
    >
      <span className={`h-2 w-2 rounded-full ${isActive ? "bg-green-600" : "bg-amber-600"}`} />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function CompanyBlock({
  company,
  expandedCompany,
  onExpand,
  onEditCompany,
  admins,
  filteredAdmins,
  adminSearch,
  setAdminSearch,
  openAdminModal,
  openPasswordModal,
  togglingId,
  handleToggleActive,
}) {
  const isExpanded = expandedCompany === company.id;
  const companyAdmins = admins[company.id];

  return (
    <>
      <tr className="hover:bg-indigo-50/40">
        <td className="px-4 py-3 font-semibold text-gray-800">{company.name}</td>
        <td className="px-4 py-3 text-gray-600">{company.description || "-"}</td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-2">
            <button
              className="text-blue-600 hover:text-blue-900 rounded-lg p-2 hover:bg-blue-50 active:scale-[0.98] transition"
              onClick={onEditCompany}
              title="Edit Company"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              className="text-indigo-600 hover:text-indigo-900 font-medium inline-flex items-center gap-1 rounded-lg px-3 py-1.5 border border-indigo-200 bg-indigo-50 active:scale-[0.98] transition"
              onClick={() => onExpand(company.id)}
            >
              <Users className="w-5 h-5" />
              {isExpanded ? "Hide Admins" : "Show Admins"}
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={3} className="bg-indigo-50/60 px-4 py-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 justify-between">
                <h2 className="font-semibold text-indigo-700 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Admins
                </h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      className="border rounded-lg pl-9 pr-3 py-2 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="Search name / phone / email"
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition"
                    onClick={() => openAdminModal("create", company.id)}
                  >
                    <Plus className="w-4 h-4" /> Add Admin
                  </button>
                </div>
              </div>

              {companyAdmins?.loading ? (
                <div className="p-4">
                  <Spinner loadingTxt="Loading admins..." />
                </div>
              ) : companyAdmins?.error ? (
                <p className="text-red-500">{companyAdmins.error}</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-indigo-100 bg-white">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100/70">
                      <tr>
                        <th className="px-3 py-2 text-xs text-gray-600 text-left uppercase">Name</th>
                        <th className="px-3 py-2 text-xs text-gray-600 text-left uppercase">Phone</th>
                        <th className="px-3 py-2 text-xs text-gray-600 text-left uppercase">Email</th>
                        <th className="px-3 py-2 text-xs text-gray-600 text-left uppercase">Status</th>
                        <th className="px-3 py-2 text-xs text-gray-600 text-right uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredAdmins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">{admin.name}</td>
                          <td className="px-3 py-2">{admin.phone}</td>
                          <td className="px-3 py-2">{admin.email}</td>
                          <td className="px-3 py-2">
                            <StatusPill status={admin.status} />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="text-blue-600 hover:text-blue-900 rounded-lg p-2 hover:bg-blue-50 active:scale-[0.98] transition"
                                onClick={() => openAdminModal("edit", company.id, admin)}
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className={`${
                                  admin.status === "active"
                                    ? "text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                                    : "text-green-600 hover:text-green-800 hover:bg-green-50"
                                } rounded-lg p-2 active:scale-[0.98] transition`}
                                onClick={() => handleToggleActive(company.id, admin)}
                                disabled={togglingId === admin.id}
                                title={admin.status === "active" ? "Deactivate" : "Activate"}
                              >
                                {togglingId === admin.id ? (
                                  <Spinner loadingTxt="" />
                                ) : admin.status === "active" ? (
                                  <ToggleLeft className="w-5 h-5" />
                                ) : (
                                  <ToggleRight className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                className="text-indigo-600 hover:text-indigo-900 rounded-lg p-2 hover:bg-indigo-50 active:scale-[0.98] transition"
                                onClick={() => openPasswordModal(admin)}
                                title="Reset Password"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredAdmins.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-6 text-center text-sm text-gray-500">
                            {adminSearch ? "No admins match your search." : "No admins found."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// Admin Modal Component (Create/Edit only)
function AdminModal({ mode, companyId, admin, onClose, onSubmit, apiError, isLoading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues:
      mode === "edit" && admin
        ? { name: admin.name, phone: admin.phone, email: admin.email }
        : { name: "", phone: "", email: "", password: "" },
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <p className="text-lg font-semibold mb-4">
          {mode === "create" ? "Create Admin" : "Edit Admin"}
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input
            className="border rounded-lg p-2"
            placeholder="Name"
            {...register("name", { required: "Name is required" })}
            disabled={isLoading}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          <input
            className="border rounded-lg p-2"
            placeholder="Phone"
            {...register("phone", { required: "Phone is required" })}
            disabled={isLoading}
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          <input
            className="border rounded-lg p-2"
            placeholder="Email"
            type="email"
            {...register("email", { required: "Email is required" })}
            disabled={isLoading}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          {mode === "create" && (
            <>
              <input
                className="border rounded-lg p-2"
                placeholder="Password"
                type="password"
                {...register("password", { required: "Password is required" })}
                disabled={isLoading}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </>
          )}
          {apiError && <p className="text-red-500 text-center">{apiError}</p>}
          <button
            type="submit"
            className="bg-indigo-600 text-white rounded-xl px-4 py-2 mt-2 disabled:bg-indigo-300 active:scale-[0.98] transition"
            disabled={isLoading}
          >
            {isLoading ? <Spinner loadingTxt={mode === "create" ? "Creating..." : "Saving..."} /> : mode === "create" ? "Create" : "Save"}
          </button>
        </form>
        <button className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl active:scale-[0.98] transition" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

// Password Reset Modal Component
function PasswordModal({ admin, onClose, onSubmit, apiError, isLoading }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <p className="text-lg font-semibold mb-4">Reset Password for {admin?.name}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="relative">
            <input
              className="border rounded-lg p-2 w-full pr-10"
              placeholder="New Password"
              type={showPassword ? "text" : "password"}
              {...register("password", { required: "Password is required" })}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500"
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={0}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          {apiError && <p className="text-red-500 text-center">{apiError}</p>}
          <button
            type="submit"
            className="bg-indigo-600 text-white rounded-xl px-4 py-2 mt-2 disabled:bg-indigo-300 active:scale-[0.98] transition"
            disabled={isLoading}
          >
            {isLoading ? <Spinner loadingTxt="Resetting..." /> : "Reset Password"}
          </button>
        </form>
        <button className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl active:scale-[0.98] transition" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

// Company Modal Component (Create/Edit)
function CompanyModal({ mode, company, onClose, onSubmit, apiError, isLoading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues:
      mode === "edit" && company
        ? { name: company.name || "", description: company.description || "" }
        : { name: "", description: "" },
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <p className="text-lg font-semibold mb-4">
          {mode === "create" ? "Add Company" : "Edit Company"}
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input
            className="border rounded-lg p-2"
            placeholder="Company Name"
            {...register("name", { required: "Company name is required" })}
            disabled={isLoading}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          <textarea
            className="border rounded-lg p-2 min-h-[96px]"
            placeholder="Description (optional)"
            {...register("description")}
            disabled={isLoading}
          />
          {apiError && <p className="text-red-500 text-center">{apiError}</p>}
          <button
            type="submit"
            className="bg-indigo-600 text-white rounded-xl px-4 py-2 mt-2 disabled:bg-indigo-300 active:scale-[0.98] transition"
            disabled={isLoading}
          >
            {isLoading ? <Spinner loadingTxt={mode === "create" ? "Creating..." : "Saving..."} /> : mode === "create" ? "Create" : "Save"}
          </button>
        </form>
        <button className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl active:scale-[0.98] transition" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
