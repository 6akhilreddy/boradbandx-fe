import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, X, Folder, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;

const preventEnterSubmit = (e) => {
  if (e.key === "Enter") e.preventDefault();
};

const CustomerPlansTab = ({
  plans,
  selectedPlans,
  onAddPlan,
  onRemovePlan,
  onClearPlans,
  fixedBillAmount,
  onFixedBillAmountChange,
  planTab,
  onPlanTabChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const filteredPlans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return plans;
    return plans.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        p.code?.toLowerCase().includes(q)
    );
  }, [plans, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / pageSize));

  const paginatedPlans = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPlans.slice(start, start + pageSize);
  }, [filteredPlans, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, pageSize, plans.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const getQty = (planId) => {
    const v = quantities[planId];
    const n = parseInt(v, 10);
    return n > 0 ? n : 1;
  };

  const handleAdd = (plan) => {
    const qty = getQty(plan.id);
    onAddPlan(plan, qty);
    setQuantities((prev) => ({ ...prev, [plan.id]: "1" }));
  };

  const groupedSelected = useMemo(() => {
    const map = new Map();
    for (const p of selectedPlans) {
      const key = p.id;
      if (map.has(key)) {
        map.get(key).quantity += 1;
      } else {
        map.set(key, { ...p, quantity: 1 });
      }
    }
    return [...map.values()];
  }, [selectedPlans]);

  const rangeStart =
    filteredPlans.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, filteredPlans.length);

  return (
    <div className="space-y-4">
      {groupedSelected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={onClearPlans}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 cursor-pointer"
          >
            Clear all ({groupedSelected.length})
          </button>
          {groupedSelected.map((plan) => (
            <span
              key={plan.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-full"
            >
              <Folder className="w-3.5 h-3.5" />
              {plan.name} ({plan.quantity})
              <button
                type="button"
                onClick={() => onRemovePlan(plan.id)}
                className="hover:text-red-300 cursor-pointer"
                aria-label="Remove plan"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => onPlanTabChange("plans")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px cursor-pointer ${
            planTab === "plans"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          SELECT PLANS
        </button>
        <button
          type="button"
          onClick={() => onPlanTabChange("fixed")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px cursor-pointer ${
            planTab === "fixed"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          FIXED BILL AMOUNT
        </button>
      </div>

      {planTab === "plans" ? (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Search for..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={preventEnterSubmit}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 cursor-pointer flex items-center justify-center gap-2"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer text-sm"
            >
              Reset
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="bbx-table-grid w-full text-sm border-collapse">
              <thead className="bg-gray-50 text-blue-700 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2.5 text-left font-medium border border-gray-200">S.No</th>
                  <th className="px-3 py-2.5 text-left font-medium border border-gray-200">Name</th>
                  <th className="px-3 py-2.5 text-left font-medium border border-gray-200">Price</th>
                  <th className="px-3 py-2.5 text-left font-medium border border-gray-200">Quantity</th>
                  <th className="px-3 py-2.5 text-center font-medium border border-gray-200">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPlans.map((plan, index) => (
                  <tr
                    key={plan.id}
                    className="border-t border-gray-100 hover:bg-gray-50/80 even:bg-gray-50/30"
                  >
                    <td className="px-3 py-2 border border-gray-200">
                      <span className="inline-block px-2 py-0.5 bg-gray-900 text-white text-xs rounded">
                        {plan.id}
                      </span>
                    </td>
                    <td className="px-3 py-2 border border-gray-200">
                      <div className="flex items-center justify-between gap-2 min-w-[180px]">
                        <span>{plan.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 border border-gray-200">{plan.monthlyPrice ?? 0}</td>
                    <td className="px-3 py-2 border border-gray-200">
                      <input
                        type="number"
                        min="1"
                        value={quantities[plan.id] ?? ""}
                        placeholder="1"
                        onChange={(e) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [plan.id]: e.target.value,
                          }))
                        }
                        onKeyDown={preventEnterSubmit}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                      />
                    </td>
                    <td className="px-3 py-2 text-center border border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleAdd(plan)}
                        className="px-3 py-1 bg-gray-900 text-white text-xs rounded hover:bg-gray-800 cursor-pointer"
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPlans.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      No plans found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredPlans.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-sm text-gray-600">
              <p>
                Showing{" "}
                <span className="font-medium text-gray-900">{rangeStart}</span>
                {" – "}
                <span className="font-medium text-gray-900">{rangeEnd}</span> of{" "}
                <span className="font-medium text-gray-900">
                  {filteredPlans.length}
                </span>{" "}
                plans
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2">
                  <span className="text-gray-600">Per page</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 min-w-[4rem] text-center">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 max-w-md mx-auto">
          <p className="text-red-600 font-bold text-lg mb-4">OR</p>
          <p className="text-gray-800 mb-4">
            ENTER FIXED BILL AMOUNT (Example rs 300 / month)
          </p>
          <input
            type="number"
            step="0.01"
            min="0"
            value={fixedBillAmount}
            onChange={(e) => onFixedBillAmountChange(e.target.value)}
            onKeyDown={preventEnterSubmit}
            className="w-full max-w-xs mx-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>
      )}
    </div>
  );
};

export default CustomerPlansTab;
