import React, { useState, useEffect } from 'react';
import { useExpense } from '../../contexts/ExpenseContext';
import { useCompany } from '../../contexts/CompanyContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';
import ExpenseForm from './ExpenseForm';
import ExpenseDetails from './ExpenseDetails';

const ExpenseList = () => {
  const { expenses, deleteExpense, getExpensesByStatus, getExpensesByCategory, getExpensesByDateRange } = useExpense();
  const { company } = useCompany();
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredExpenses, setFilteredExpenses] = useState(expenses);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, statusFilter, categoryFilter, dateFilter]);

  const filterExpenses = () => {
    let filtered = [...expenses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(expense => expense.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate, endDate;

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear() + 1, 0, 1);
          break;
        default:
          break;
      }

      if (startDate && endDate) {
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= startDate && expenseDate < endDate;
        });
      }
    }

    setFilteredExpenses(filtered);
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setShowForm(true);
  };

  const handleView = (expense) => {
    setSelectedExpense(expense);
    setShowDetails(true);
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const result = await deleteExpense(expenseId);
      if (result.success) {
        // Expense deleted successfully
      } else {
        // Handle error
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedExpense(null);
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'badge-warning', text: 'Pending' },
      approved: { class: 'badge-success', text: 'Approved' },
      rejected: { class: 'badge-danger', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getTotalAmount = () => {
    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Expenses</h1>
          <p className="text-gray-600">Manage and track your expense submissions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Submit New Expense
        </button>
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
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

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

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredExpenses.length} of {expenses.length} expenses
              </span>
              <span className="font-medium">
                Total: {formatCurrency(getTotalAmount(), company?.currency || 'USD')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="card">
        <div className="card-body p-0">
          {filteredExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id}>
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
                        {getStatusBadge(expense.status)}
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
                          {expense.status === 'pending' && (
                            <button
                              onClick={() => handleEdit(expense)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {expense.status === 'pending' && (
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by submitting your first expense'
                }
              </p>
              {(!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && dateFilter === 'all') && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Submit New Expense
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <ExpenseForm
          expense={selectedExpense}
          onClose={() => {
            setShowForm(false);
            setSelectedExpense(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {showDetails && selectedExpense && (
        <ExpenseDetails
          expense={selectedExpense}
          onClose={() => {
            setShowDetails(false);
            setSelectedExpense(null);
          }}
        />
      )}
    </div>
  );
};

export default ExpenseList;
