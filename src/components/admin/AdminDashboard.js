import React from 'react';
import { useExpense } from '../../contexts/ExpenseContext';
import { useCompany } from '../../contexts/CompanyContext';
import { 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Clock, 
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { expenses, getExpensesStats, getTotalExpenses } = useExpense();
  const { company, employees } = useCompany();

  const stats = getExpensesStats();
  const totalAmount = getTotalExpenses();
  const pendingAmount = getTotalExpenses(expenses.filter(exp => exp.status === 'pending'));
  const approvedAmount = getTotalExpenses(expenses.filter(exp => exp.status === 'approved'));

  const formatCurrency = (amount, currency = company?.currency || 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const recentExpenses = expenses.slice(0, 5);
  const pendingApprovals = expenses.filter(exp => exp.status === 'pending').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingExpenses}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(pendingAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.approvedExpenses}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(approvedAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Employees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Expenses</h3>
          </div>
          <div className="card-body">
            {recentExpenses.length > 0 ? (
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                        expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {expense.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No expenses yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pending Approvals</h3>
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
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
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
      </div>

      {/* System Status */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">System Status</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900">System Online</h4>
              <p className="text-sm text-gray-500">All services operational</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">Performance</h4>
              <p className="text-sm text-gray-500">Response time: 120ms</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <h4 className="font-medium text-gray-900">Alerts</h4>
              <p className="text-sm text-gray-500">{pendingApprovals.length} pending approvals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
