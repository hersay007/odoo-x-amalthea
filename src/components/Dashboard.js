import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useExpense } from '../contexts/ExpenseContext';
import { useCompany } from '../contexts/CompanyContext';
import { 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  Plus,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const { expenses, getExpensesStats, getTotalExpenses } = useExpense();
  const { company, employees } = useCompany();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingExpenses: 0,
    approvedExpenses: 0,
    rejectedExpenses: 0,
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0
  });

  useEffect(() => {
    if (expenses.length > 0) {
      const expenseStats = getExpensesStats();
      const totalAmount = getTotalExpenses();
      const pendingAmount = getTotalExpenses(expenses.filter(exp => exp.status === 'pending'));
      const approvedAmount = getTotalExpenses(expenses.filter(exp => exp.status === 'approved'));

      setStats({
        ...expenseStats,
        totalAmount,
        pendingAmount,
        approvedAmount
      });
    }
  }, [expenses, getExpensesStats, getTotalExpenses]);

  const recentExpenses = expenses.slice(0, 5);
  const pendingApprovals = expenses.filter(exp => exp.status === 'pending').slice(0, 3);

  const formatCurrency = (amount, currency = company?.currency || 'USD') => {
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

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 className="welcome-title">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="welcome-subtitle">
          {hasRole('admin') && 'Manage your company\'s expenses and approvals'}
          {hasRole('manager') && 'Review and approve team expenses'}
          {hasRole('employee') && 'Track your expense submissions and approvals'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon stat-icon-blue">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Amount</p>
              <p className="stat-value">
                {formatCurrency(stats.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon stat-icon-yellow">
              <Clock className="h-6 w-6" />
            </div>
            <div className="stat-info">
              <p className="stat-label">Pending</p>
              <p className="stat-value">
                {stats.pendingExpenses}
              </p>
              <p className="stat-subvalue">
                {formatCurrency(stats.pendingAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon stat-icon-green">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="stat-info">
              <p className="stat-label">Approved</p>
              <p className="stat-value">
                {stats.approvedExpenses}
              </p>
              <p className="stat-subvalue">
                {formatCurrency(stats.approvedAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon stat-icon-purple">
              <FileText className="h-6 w-6" />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Expenses</p>
              <p className="stat-value">
                {stats.totalExpenses}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title">Recent Expenses</h3>
              <Link to="/expenses" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View all
              </Link>
            </div>
          </div>
          <div className="card-body">
            {recentExpenses.length > 0 ? (
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-500">{expense.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(expense.amount, expense.currency)}
                      </p>
                      {getStatusBadge(expense.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No expenses yet</p>
                <Link to="/expenses" className="btn btn-primary mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Expense
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Pending Approvals (for managers/admins) */}
        {(hasRole('manager') || hasRole('admin')) && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="card-title">Pending Approvals</h3>
                <Link to="/approvals" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all
                </Link>
              </div>
            </div>
            <div className="card-body">
              {pendingApprovals.length > 0 ? (
                <div className="space-y-4">
                  {pendingApprovals.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{expense.description}</p>
                        <p className="text-sm text-gray-500">
                          {expense.user?.firstName} {expense.user?.lastName} • {expense.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(expense.amount, expense.currency)}
                        </p>
                        <div className="flex space-x-2 mt-1">
                          <button className="btn btn-success btn-sm">
                            Approve
                          </button>
                          <button className="btn btn-danger btn-sm">
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending approvals</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Team Overview (for managers/admins) */}
        {(hasRole('manager') || hasRole('admin')) && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="card-title">Team Overview</h3>
                <Link to="/team" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Manage team
                </Link>
              </div>
            </div>
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Total Employees</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {employees.length}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Managers</span>
                  <span className="font-medium">
                    {employees.filter(emp => emp.role === 'manager').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Employees</span>
                  <span className="font-medium">
                    {employees.filter(emp => emp.role === 'employee').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/expenses" className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Submit New Expense
            </Link>
            
            <Link to="/expenses" className="btn btn-outline">
              <Eye className="h-4 w-4 mr-2" />
              View My Expenses
            </Link>
            
            {(hasRole('manager') || hasRole('admin')) && (
              <Link to="/approvals" className="btn btn-outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Review Approvals
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
