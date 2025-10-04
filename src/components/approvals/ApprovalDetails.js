import React, { useState } from 'react';
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
  AlertCircle,
  MessageSquare
} from 'lucide-react';

const ApprovalDetails = ({ expense, onClose, onApprove, onReject, loading }) => {
  const { company } = useCompany();
  const [comments, setComments] = useState('');
  const [showComments, setShowComments] = useState(false);

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleApprove = () => {
    onApprove(expense.id, comments);
    setComments('');
    setShowComments(false);
  };

  const handleReject = () => {
    onReject(expense.id, comments);
    setComments('');
    setShowComments(false);
  };

  const getPriorityColor = (amount) => {
    if (amount > 1000) return 'text-red-600 bg-red-100';
    if (amount > 500) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getPriorityText = (amount) => {
    if (amount > 1000) return 'High Priority';
    if (amount > 500) return 'Medium Priority';
    return 'Low Priority';
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-4xl">
        <div className="modal-header">
          <h2 className="modal-title">Expense Approval Details</h2>
          <button onClick={onClose} className="modal-close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="modal-body">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status and Amount */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Pending Approval
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(expense.amount)}`}>
                    {getPriorityText(expense.amount)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(expense.amount, expense.currency)}
                  </p>
                  {expense.currency !== (company?.currency || 'USD') && (
                    <p className="text-sm text-gray-500">
                      {formatCurrency(expense.convertedAmount || expense.amount, company?.currency || 'USD')}
                    </p>
                  )}
                </div>
              </div>

              {/* Expense Details */}
              <div className="card">
                <div className="card-body">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </div>

              {/* Employee Information */}
              <div className="card">
                <div className="card-body">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Submitted By</h3>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {expense.user?.firstName} {expense.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{expense.user?.email}</p>
                      <p className="text-sm text-gray-500">
                        Role: {expense.user?.role?.charAt(0).toUpperCase() + expense.user?.role?.slice(1)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Submitted:</strong> {new Date(expense.createdAt).toLocaleDateString('en-US', {
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
                <div className="card">
                  <div className="card-body">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Receipt</h3>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-4">
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
                </div>
              )}
            </div>

            {/* Approval Actions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="card">
                <div className="card-body">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => onApprove(expense.id)}
                      disabled={loading === 'approve'}
                      className="w-full btn btn-success"
                    >
                      {loading === 'approve' ? (
                        <div className="loading"></div>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => onReject(expense.id)}
                      disabled={loading === 'reject'}
                      className="w-full btn btn-danger"
                    >
                      {loading === 'reject' ? (
                        <div className="loading"></div>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Comments</h3>
                    <button
                      onClick={() => setShowComments(!showComments)}
                      className="btn btn-outline btn-sm"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {showComments ? 'Hide' : 'Add'}
                    </button>
                  </div>
                  
                  {showComments && (
                    <div className="space-y-3">
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Add comments for approval/rejection..."
                        className="form-textarea"
                        rows={4}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleApprove}
                          disabled={loading === 'approve'}
                          className="flex-1 btn btn-success btn-sm"
                        >
                          Approve with Comments
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={loading === 'reject'}
                          className="flex-1 btn btn-danger btn-sm"
                        >
                          Reject with Comments
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Guidelines */}
              <div className="card">
                <div className="card-body">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Guidelines</h3>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>Verify receipt matches the expense details</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>Check if expense is business-related</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>Ensure amount is reasonable for category</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>Consider company expense policies</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

export default ApprovalDetails;
