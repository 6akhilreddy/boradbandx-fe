import React, { useState, useEffect } from "react";
import { Download, Trash2, Banknote, Hand, FileText } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

const BalanceHistory = ({ customerId }) => {
  const [transactions, setTransactions] = useState([]);
  const [pendingCharges, setPendingCharges] = useState({ totalAmount: 0, charges: [] });
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customerId) {
      fetchBalanceHistory();
    }
  }, [customerId]);

  const fetchBalanceHistory = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/customers/${customerId}/balance-history`);
      const { data } = response.data;
      
      setTransactions(data.transactions || []);
      setPendingCharges(data.pendingCharges || { totalAmount: 0, charges: [] });
      setCurrentBalance(data.currentBalance || 0);
    } catch (err) {
      console.error("Error fetching balance history:", err);
      setError("Failed to load balance history");
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "PAYMENT":
        return <Banknote className="w-6 h-6 text-blue-500" />;
      case "BILL_GENERATION":
        return <FileText className="w-6 h-6 text-blue-500" />;
      case "BALANCE_ADJUSTMENT":
      case "PENDING_CHARGE_ADDED":
      case "PENDING_CHARGE_APPLIED":
        return <Hand className="w-6 h-6 text-blue-500" />;
      default:
        return <Banknote className="w-6 h-6 text-blue-500" />;
    }
  };

  const getTransactionTitle = (transaction) => {
    switch (transaction.type) {
      case "PAYMENT":
        return `Payment On ${new Date(transaction.transactionDate).toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short', 
          year: '2-digit' 
        })}`;
      case "BILL_GENERATION":
        return `Bill From ${new Date(transaction.transactionDate).toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short', 
          year: '2-digit' 
        })} To ${new Date(transaction.transactionDate).toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short', 
          year: '2-digit' 
        })}`;
      case "BALANCE_ADJUSTMENT":
        return transaction.description || "Balance Adjustment";
      case "PENDING_CHARGE_ADDED":
        return transaction.description || "Pending Charge Added";
      case "PENDING_CHARGE_APPLIED":
        return transaction.description || "Pending Charge Applied";
      default:
        return transaction.description || "Transaction";
    }
  };

  const getTransactionSubtitle = (transaction) => {
    switch (transaction.type) {
      case "PAYMENT":
        return `Recorded On ${new Date(transaction.recordedDate).toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        })}`;
      case "BILL_GENERATION":
        return `Billed On ${new Date(transaction.recordedDate).toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        })}`;
      case "BALANCE_ADJUSTMENT":
        return `Changed On ${new Date(transaction.recordedDate).toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        })}`;
      default:
        return `Recorded On ${new Date(transaction.recordedDate).toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        })}`;
    }
  };

  const getAmountDisplay = (transaction) => {
    const amount = Math.abs(transaction.amount);
    const isNegative = transaction.type === "PAYMENT" || transaction.amount < 0;
    
    if (isNegative) {
      return <span className="text-red-600">(-) ₹{amount.toLocaleString()}</span>;
    } else {
      return <span className="text-green-600">(+) ₹{amount.toLocaleString()}</span>;
    }
  };

  const getFinalBalanceDisplay = (transaction) => {
    const balance = transaction.balanceAfter;
    if (balance === 0) {
      return <span className="text-gray-600">₹0</span>;
    } else if (balance > 0) {
      return (
        <div className="flex items-center gap-2">
          <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">₹{balance.toLocaleString()}</span>
          <span className="text-gray-600">Due</span>
        </div>
      );
    } else {
      return <span className="text-blue-600">₹{Math.abs(balance).toLocaleString()}</span>;
    }
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log("Download balance history");
  };

  const handleDeleteTransaction = async (transactionId) => {
    // TODO: Implement delete functionality
    console.log("Delete transaction:", transactionId);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">Balance History</h2>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TRANSACTION AMOUNT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FINAL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction, index) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {getTransactionTitle(transaction)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getTransactionSubtitle(transaction)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium">
                    {getAmountDisplay(transaction)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getFinalBalanceDisplay(transaction)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.type === "PAYMENT" && (
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pending Charges Summary */}
      {pendingCharges.totalAmount > 0 && (
        <div className="p-6 border-t bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Charges</h3>
          <div className="space-y-2">
            {pendingCharges.charges.map((charge) => (
              <div key={charge.id} className="flex justify-between items-center p-3 bg-white rounded border">
                <div>
                  <div className="font-medium text-gray-900">{charge.description}</div>
                  <div className="text-sm text-gray-500">{charge.chargeType.replace('_', ' ')}</div>
                </div>
                <div className="text-lg font-semibold text-gray-900">₹{charge.amount.toLocaleString()}</div>
              </div>
            ))}
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded border">
              <div className="font-semibold text-gray-900">Total Pending</div>
              <div className="text-lg font-bold text-blue-600">₹{pendingCharges.totalAmount.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceHistory;
