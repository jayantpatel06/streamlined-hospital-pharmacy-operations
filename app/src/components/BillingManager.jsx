import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const BillingManager = ({ onBack, selectedPatient }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bills');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'cash',
    amountPaid: '',
    paymentReference: '',
    notes: ''
  });

  const { userRole, userDetails, getBills, updateBillPayment, createBill } = useAuth();

  useEffect(() => {
    loadBills();
  }, [selectedPatient, userRole]);

  const loadBills = async () => {
    try {
      setLoading(true);
      let filters = {};
      
      if (selectedPatient) {
        filters.patientId = selectedPatient.patientId;
      } else if (userRole === 'patient') {
        filters.patientId = userDetails?.patientId;
      }
      
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const billsData = await getBills(filters);
      setBills(billsData);
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await updateBillPayment(selectedBill.billId, {
        ...paymentData,
        amountPaid: parseFloat(paymentData.amountPaid)
      });
      
      setBills(prev => prev.map(bill => 
        bill.billId === selectedBill.billId 
          ? { ...bill, status: 'paid', paymentMethod: paymentData.paymentMethod, paymentDate: new Date().toISOString() }
          : bill
      ));
      
      setShowPaymentForm(false);
      setSelectedBill(null);
      setPaymentData({
        paymentMethod: 'cash',
        amountPaid: '',
        paymentReference: '',
        notes: ''
      });
      
      alert('💰 Payment processed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.billId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
      case 'partial': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const calculateTotalRevenue = () => {
    return bills
      .filter(bill => bill.status === 'paid')
      .reduce((total, bill) => total + (bill.totalAmount || 0), 0);
  };

  const calculatePendingAmount = () => {
    return bills
      .filter(bill => bill.status === 'pending')
      .reduce((total, bill) => total + (bill.totalAmount || 0), 0);
  };

  if (userRole !== 'receptionist' && userRole !== 'admin' && userRole !== 'patient') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">Only authorized staff and patients can access billing information.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">💰 Billing Manager</h2>
          <p className="text-gray-600 mt-1">Manage bills, payments, and financial records</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Financial Summary Cards */}
      {(userRole === 'receptionist' || userRole === 'admin') && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">💰 Total Revenue</h3>
            <p className="text-3xl font-bold">${calculateTotalRevenue().toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">⏳ Pending Payments</h3>
            <p className="text-3xl font-bold">${calculatePendingAmount().toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">📄 Total Bills</h3>
            <p className="text-3xl font-bold">{bills.length}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">✅ Paid Bills</h3>
            <p className="text-3xl font-bold">{bills.filter(b => b.status === 'paid').length}</p>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Bills</label>
            <input
              type="text"
              placeholder="Search by patient name, bill ID, or patient ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                loadBills();
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="partial">Partial Payment</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadBills}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Bills List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading bills...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBills.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No bills found</p>
            </div>
          ) : (
            filteredBills.map(bill => (
              <div key={bill.billId} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Bill #{bill.billId}</h3>
                    <p className="text-gray-600">Patient: {bill.patientName} ({bill.patientId})</p>
                    <p className="text-sm text-gray-500">Date: {new Date(bill.billDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(bill.status)}`}>
                      {bill.status.toUpperCase()}
                    </span>
                    <p className="text-xl font-bold text-gray-800 mt-2">${bill.totalAmount?.toFixed(2)}</p>
                  </div>
                </div>

                {/* Services */}
                {bill.services && bill.services.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">🏥 Services:</h4>
                    <ul className="space-y-1">
                      {bill.services.map((service, index) => (
                        <li key={index} className="flex justify-between text-sm">
                          <span>{service.name}</span>
                          <span className="font-medium">${service.cost?.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Medications */}
                {bill.medications && bill.medications.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">💊 Medications:</h4>
                    <ul className="space-y-1">
                      {bill.medications.map((med, index) => (
                        <li key={index} className="flex justify-between text-sm">
                          <span>{med.name} (Qty: {med.quantity})</span>
                          <span className="font-medium">${(med.cost * med.quantity)?.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bill Breakdown */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Subtotal:</span>
                    <span>${(bill.totalAmount - bill.tax)?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tax (10%):</span>
                    <span>${bill.tax?.toFixed(2)}</span>
                  </div>
                  {bill.discount > 0 && (
                    <div className="flex justify-between text-sm mb-1 text-green-600">
                      <span>Discount:</span>
                      <span>-${bill.discount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span>${bill.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Actions */}
                {(userRole === 'receptionist' || userRole === 'admin') && bill.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={() => {
                        setSelectedBill(bill);
                        setPaymentData(prev => ({ ...prev, amountPaid: bill.totalAmount?.toString() || '' }));
                        setShowPaymentForm(true);
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      💳 Process Payment
                    </button>
                  </div>
                )}

                {/* Payment Info for Paid Bills */}
                {bill.status === 'paid' && (
                  <div className="mt-4 pt-4 border-t bg-green-50 p-3 rounded">
                    <p className="text-green-800 font-medium">✅ Payment Completed</p>
                    <p className="text-sm text-green-600">
                      Method: {bill.paymentMethod} | Date: {new Date(bill.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Process Payment - Bill #{selectedBill.billId}</h3>
            
            <form onSubmit={handlePayment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="insurance">Insurance</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentData.amountPaid}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amountPaid: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference (Optional)</label>
                <input
                  type="text"
                  value={paymentData.paymentReference}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, paymentReference: e.target.value }))}
                  placeholder="Transaction ID, Cheque number, etc."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setSelectedBill(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                >
                  {loading ? 'Processing...' : 'Process Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManager;
