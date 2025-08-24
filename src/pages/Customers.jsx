
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useCustomerStore } from "../store/customerStore";
import Spinner from "../components/Spinner";

const Customers = () => {
  const {
    customers,
    loading,
    error,
    fetchCustomers,
    addCustomer,
    editCustomer,
    removeCustomer,
  } = useCustomerStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "" });

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleFilter = (e) => {
    setFilter(e.target.value);
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    await addCustomer(newCustomer);
    setShowAdd(false);
    setNewCustomer({ name: "", email: "" });
  };

  const filteredCustomers = customers
    .filter((c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((c) =>
      filter ? c.status === filter : true
    );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Customers</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowAdd(true)}
        >
          + Add New Customer
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={handleSearch}
          className="border px-3 py-2 rounded w-64"
        />
        <select
          value={filter}
          onChange={handleFilter}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <Spinner loadingTxt="Loading customers..." />
      ) : error ? (
        <div className="text-red-500">Error loading customers.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-400">No customers found.</td>
                </tr>
              ) : (
                filteredCustomers.map((c, idx) => (
                  <tr key={c.id || idx}>
                    <td className="px-6 py-4 whitespace-nowrap">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${c.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}>
                        {c.status || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <button
                        className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                        onClick={() => alert("Edit feature coming soon")}
                      >Edit</button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => removeCustomer(c.id)}
                      >Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add New Customer</h3>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newCustomer.name}
                onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newCustomer.email}
                onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setShowAdd(false)}
                >Cancel</button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Customers;
