import React, { useState, useEffect } from 'react';
import { useExpense } from '../../contexts/ExpenseContext';
import { useCompany } from '../../contexts/CompanyContext';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  Eye,
  User,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';
import ApprovalDetails from './ApprovalDetails';
import toast from 'react-hot-toast';

const ApprovalList = () => {
  const { pendingApprovals, approveExpense, rejectExpense } = useExpense();
  const { company } = useCompany();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [filteredApprovals, setFilteredApprovals] = useState(pendingApprovals);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    filterApprovals();
  }, [pendingApprovals, searchTerm, statusFilter, categoryFilter, amountFilter]);

  const filterApprovals = () => {
    let filtered = [...pendingApprovals];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    // Amount filter
    if (amountFilter !== 'all') {
      const amount = parseFloat(amountFilter);
      filtered = filtered.filter(expense => {
        const expenseAmount = expense.convertedAmount || expense.amount;
        return expenseAmount >= amount;
      });
    }

    setFilteredApprovals(filtered);
  };

  const handleApprove = async (expenseId, comments = '') => {
    setActionLoading(prev => ({ ...prev, [expenseId]: 'approve' }));
    
    try {
      const result = await approveExpense(expenseId, comments);
      if (result.success) {
        toast.success('Expense approved successfully');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to approve expense');
    } finally {
      setActionLoading(prev => ({ ...prev, [expenseId]: null }));
    }
  };

  const handleReject = async (expenseId, comments = '') => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason === null) return; // User cancelled

    setActionLoading(prev => ({ ...prev, [expenseId]: 'reject' }));
    
    try {
      const result = await rejectExpense(expenseId, reason);
      if (result.success) {
        toast.success('Expense rejected');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to reject expense');
    } finally {
      setActionLoading(prev => ({ ...prev, [expenseId]: null }));
    }
  };

  const handleView = (expense) => {
    setSelectedExpense(expense);
    setShowDetails(true);
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getAmountFilterOptions = () => {
    const amounts = [0, 50, 100, 200, 500, 1000, 2000, 5000];
    return amounts.map(amount => ({
      value: amount.toString(),
      label: amount === 0 ? 'All Amounts' : `$${amount}+`
    }));
  };

  const getTotalPendingAmount = () => {
    return filteredApprovals.reduce((total, expense) => {
      return total + (expense.convertedAmount || expense.amount);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-600">Review and approve expense submissions</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Pending</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(getTotalPendingAmount(), company?.currency || 'USD')}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search approvals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Categories</option>
              <option value="Travel">Travel</option>
              <option value="Meals">Meals</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Transportation">Transportation</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Training">Training</option>
              <option value="Other">Other</option>
            </select>

            {/* Amount Filter */}
            <select
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              className="form-select"
            >
              {getAmountFilterOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredApprovals.length} of {pendingApprovals.length} pending approvals
              </span>
              <span className="font-medium">
                Total: {formatCurrency(getTotalPendingAmount(), company?.currency || 'USD')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Approvals List */}
      <div className="card">
        <div className="card-body p-0">
          {filteredApprovals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Priority</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApprovals.map((expense) => (
                    <tr key={expense.id}>
                      <td>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {expense.user?.firstName} {expense.user?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{expense.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{expense.description}</p>
                            {expense.receipt && (
                              <p className="text-sm text-gray-500">Receipt attached</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600">{expense.category}</span>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(expense.amount, expense.currency)}
                          </p>
                          {expense.currency !== (company?.currency || 'USD') && (
                            <p className="text-sm text-gray-500">
                              {formatCurrency(expense.convertedAmount || expense.amount, company?.currency || 'USD')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          expense.amount > 1000 ? 'bg-red-100 text-red-800' :
                          expense.amount > 500 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {expense.amount > 1000 ? 'High' :
                           expense.amount > 500 ? 'Medium' : 'Low'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(expense)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleApprove(expense.id)}
                            disabled={actionLoading[expense.id] === 'approve'}
                            className="btn btn-success btn-sm"
                          >
                            {actionLoading[expense.id] === 'approve' ? (
                              <div className="loading"></div>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(expense.id)}
                            disabled={actionLoading[expense.id] === 'reject'}
                            className="btn btn-danger btn-sm"
                          >
                            {actionLoading[expense.id] === 'reject' ? (
                              <div className="loading"></div>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
              <p className="text-gray-500">
                {searchTerm || categoryFilter !== 'all' || amountFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'All caught up! No expenses are waiting for approval.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Approval Details Modal */}
      {showDetails && selectedExpense && (
        <ApprovalDetails
          expense={selectedExpense}
          onClose={() => {
            setShowDetails(false);
            setSelectedExpense(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={actionLoading[selectedExpense.id]}
        />
      )}
    </div>
  );
};

export default ApprovalList;
