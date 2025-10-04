import React from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { 
  X, 
  Calendar, 
  DollarSign, 
  FileText, 
  User, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const ExpenseDetails = ({ expense, onClose }) => {
  const { company } = useCompany();

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-2xl">
        <div className="modal-header">
          <h2 className="modal-title">Expense Details</h2>
          <button onClick={onClose} className="modal-close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="modal-body">
          {/* Status and Amount */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {getStatusIcon(expense.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(expense.status)}`}>
                {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(expense.amount, expense.currency)}
              </p>
              {expense.currency !== (company?.currency || 'USD') && (
                <p className="text-sm text-gray-500">
                  {formatCurrency(expense.convertedAmount || expense.amount, company?.currency || 'USD')}
                </p>
              )}
            </div>
          </div>

          {/* Main Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="mt-1 text-gray-900">{expense.description}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Category</label>
              <p className="mt-1 text-gray-900">{expense.category}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Date</label>
              <div className="mt-1 flex items-center text-gray-900">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(expense.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Currency</label>
              <p className="mt-1 text-gray-900">{expense.currency}</p>
            </div>
          </div>

          {/* Submitted By */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {expense.user?.firstName} {expense.user?.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  Submitted on {new Date(expense.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Receipt */}
          {expense.receipt && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <label className="text-sm font-medium text-gray-500 mb-3 block">Receipt</label>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Receipt attached</p>
                    <p className="text-sm text-gray-500">
                      {expense.receipt.name || 'Receipt file'}
                    </p>
                  </div>
                </div>
                {expense.receiptUrl && (
                  <div className="mt-4">
                    <img 
                      src={expense.receiptUrl} 
                      alt="Receipt" 
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Approval Details */}
          {expense.status !== 'pending' && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Details</h3>
              
              {expense.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Approved</p>
                      <p className="text-sm text-green-700">
                        by {expense.approvedBy?.firstName} {expense.approvedBy?.lastName}
                      </p>
                      {expense.approvedAt && (
                        <p className="text-sm text-green-600">
                          on {new Date(expense.approvedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  {expense.approvalComments && (
                    <div className="mt-3">
                      <p className="text-sm text-green-800">
                        <strong>Comments:</strong> {expense.approvalComments}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {expense.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Rejected</p>
                      <p className="text-sm text-red-700">
                        by {expense.rejectedBy?.firstName} {expense.rejectedBy?.lastName}
                      </p>
                      {expense.rejectedAt && (
                        <p className="text-sm text-red-600">
                          on {new Date(expense.rejectedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  {expense.rejectionReason && (
                    <div className="mt-3">
                      <p className="text-sm text-red-800">
                        <strong>Reason:</strong> {expense.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Approval History */}
          {expense.approvalHistory && expense.approvalHistory.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Approval History</h3>
              <div className="space-y-4">
                {expense.approvalHistory.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'approved' ? 'bg-green-100' :
                      step.status === 'rejected' ? 'bg-red-100' :
                      'bg-gray-100'
                    }`}>
                      {step.status === 'approved' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : step.status === 'rejected' ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {step.approver?.firstName} {step.approver?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                        {step.comments && ` - ${step.comments}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(step.timestamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-outline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetails;
