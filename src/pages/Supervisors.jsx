import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Layout from "../components/Layout";
import useSupervisorStore from "../store/supervisorStore";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";
import { loginAsSupervisor } from "../api/authApi";
import useUserStore from "../store/userStore";
import routes from "../config/routes";
import { useNavigate } from "react-router-dom";
import { Search, Plus, LogIn } from "lucide-react";

const Supervisors = () => {
  const navigate = useNavigate();
  const { supervisors, loading, fetchSupervisors, addSupervisor, editSupervisor } =
    useSupervisorStore();
  const setUser = useUserStore((state) => state.setUser);
  const hasPermission = useUserStore((state) => state.hasPermission);
  const canManage = hasPermission("supervisor.manage");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedForLogin, setSelectedForLogin] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });
  const [buttonLoading, setButtonLoading] = useState(false);

  const { register: registerAdd, handleSubmit: handleAddSubmit, reset: resetAdd } = useForm();
  const { register: registerEdit, handleSubmit: handleEditSubmit, reset: resetEdit, setValue: setEditValue } = useForm();

  useEffect(() => {
    const t = setTimeout(() => {
      fetchSupervisors({
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
    }, 350);
    return () => clearTimeout(t);
  }, [search, statusFilter, fetchSupervisors]);

  const handleLoginAsSupervisor = async () => {
    if (!selectedForLogin) return;
    setButtonLoading(true);
    try {
      const response = await loginAsSupervisor(selectedForLogin.id);
      setUser(response.user, response.token);
      await new Promise((r) => setTimeout(r, 100));
      setShowLoginModal(false);
      navigate(routes.SUPERVISOR_DASHBOARD, { replace: true });
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: error.response?.data?.message || error.message || "Failed to login as supervisor",
      });
    } finally {
      setButtonLoading(false);
    }
  };

  const onAdd = async (data) => {
    setButtonLoading(true);
    try {
      await addSupervisor(data);
      setShowAddModal(false);
      resetAdd();
      setAlert({ show: true, type: "success", message: "Supervisor added" });
      fetchSupervisors();
    } catch {
      setAlert({ show: true, type: "error", message: "Failed to add supervisor" });
    } finally {
      setButtonLoading(false);
    }
  };

  const onEdit = async (data) => {
    setButtonLoading(true);
    try {
      await editSupervisor(editing.id, data);
      setShowEditModal(false);
      setEditing(null);
      resetEdit();
      setAlert({ show: true, type: "success", message: "Supervisor updated" });
    } catch {
      setAlert({ show: true, type: "error", message: "Failed to update supervisor" });
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mt-2 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Supervisors</h2>
        {canManage && (
          <button type="button" onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-blue-600 cursor-pointer">
            <Plus className="w-4 h-4" /> Add Supervisor
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search supervisors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-full bg-gray-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-full bg-gray-100"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {loading ? (
        <Spinner loadingTxt="Loading supervisors..." />
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Agents</th>
                <th className="px-4 py-3 text-left">Team collection</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {supervisors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No supervisors found
                  </td>
                </tr>
              ) : (
                supervisors.map((s) => (
                  <tr key={s.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3">{s.phone}</td>
                    <td className="px-4 py-3">{s.agentCount ?? 0}</td>
                    <td className="px-4 py-3">₹{Math.round(s.collection?.total || 0)}</td>
                    <td className="px-4 py-3">{s.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(s);
                              setEditValue("name", s.name);
                              setEditValue("email", s.email || "");
                              setEditValue("phone", s.phone);
                              setEditValue("status", s.status);
                              setShowEditModal(true);
                            }}
                            className="px-3 py-1.5 rounded-md bg-gray-100 text-xs cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedForLogin(s);
                            setShowLoginModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-600 text-white text-xs cursor-pointer"
                        >
                          <LogIn className="w-3 h-3" />
                          Login
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showLoginModal && selectedForLogin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Login as Supervisor</h3>
            <p className="text-gray-600 mb-4">
              Continue as <strong>{selectedForLogin.name}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowLoginModal(false)} className="px-4 py-2 border rounded-lg cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={handleLoginAsSupervisor} disabled={buttonLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer">
                Login as Supervisor
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && canManage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Add Supervisor</h3>
            <form onSubmit={handleAddSubmit(onAdd)} className="space-y-3">
              <input placeholder="Name" {...registerAdd("name", { required: true })} className="w-full border rounded px-3 py-2" />
              <input placeholder="Email" {...registerAdd("email")} className="w-full border rounded px-3 py-2" />
              <input placeholder="Phone" {...registerAdd("phone", { required: true })} className="w-full border rounded px-3 py-2" />
              <input type="password" placeholder="Password" {...registerAdd("password", { required: true })} className="w-full border rounded px-3 py-2" />
              <select {...registerAdd("status")} className="w-full border rounded px-3 py-2" defaultValue="ACTIVE">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editing && canManage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Supervisor</h3>
            <form onSubmit={handleEditSubmit(onEdit)} className="space-y-3">
              <input {...registerEdit("name", { required: true })} className="w-full border rounded px-3 py-2" />
              <input {...registerEdit("email")} className="w-full border rounded px-3 py-2" />
              <input {...registerEdit("phone", { required: true })} className="w-full border rounded px-3 py-2" />
              <select {...registerEdit("status")} className="w-full border rounded px-3 py-2">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Alert alert={alert} setAlert={setAlert} />
    </Layout>
  );
};

export default Supervisors;
