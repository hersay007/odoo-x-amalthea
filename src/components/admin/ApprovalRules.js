import React, { useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  CheckCircle,
  Percent,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

const ApprovalRules = () => {
  const { company } = useCompany();
  const [rules, setRules] = useState([
    {
      id: 1,
      name: 'Standard Approval',
      type: 'sequential',
      conditions: [
        { type: 'amount', operator: '>', value: 100, currency: 'USD' }
      ],
      approvers: [
        { id: 1, name: 'Manager', order: 1, required: true },
        { id: 2, name: 'Finance', order: 2, required: true }
      ],
      active: true
    },
    {
      id: 2,
      name: 'High Value Approval',
      type: 'conditional',
      conditions: [
        { type: 'amount', operator: '>', value: 1000, currency: 'USD' }
      ],
      approvers: [
        { id: 1, name: 'Manager', order: 1, required: true },
        { id: 2, name: 'Finance', order: 2, required: true },
        { id: 3, name: 'Director', order: 3, required: true }
      ],
      conditionalRules: {
        type: 'percentage',
        value: 60
      },
      active: true
    }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  const handleCreate = () => {
    setSelectedRule(null);
    setShowForm(true);
  };

  const handleEdit = (rule) => {
    setSelectedRule(rule);
    setShowForm(true);
  };

  const handleDelete = (ruleId) => {
    if (window.confirm('Are you sure you want to delete this approval rule?')) {
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      toast.success('Approval rule deleted successfully');
    }
  };

  const handleToggleActive = (ruleId) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, active: !rule.active } : rule
    ));
    toast.success('Rule status updated');
  };

  const getRuleTypeIcon = (type) => {
    switch (type) {
      case 'sequential':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'conditional':
        return <Percent className="h-5 w-5 text-green-600" />;
      case 'hybrid':
        return <Settings className="h-5 w-5 text-purple-600" />;
      default:
        return <Settings className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRuleTypeText = (type) => {
    switch (type) {
      case 'sequential':
        return 'Sequential Approval';
      case 'conditional':
        return 'Conditional Approval';
      case 'hybrid':
        return 'Hybrid Approval';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Approval Rules</h2>
          <p className="text-gray-600">Configure how expenses are approved in your organization</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getRuleTypeIcon(rule.type)}
                    <h3 className="text-lg font-medium text-gray-900">{rule.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {getRuleTypeText(rule.type)}
                  </p>

                  {/* Conditions */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Conditions</h4>
                    <div className="space-y-1">
                      {rule.conditions.map((condition, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          Amount {condition.operator} {condition.value} {condition.currency}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Approvers */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Approvers</h4>
                    <div className="flex flex-wrap gap-2">
                      {rule.approvers.map((approver) => (
                        <div key={approver.id} className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
                          <User className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">{approver.name}</span>
                          <span className="text-xs text-gray-500">#{approver.order}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conditional Rules */}
                  {rule.conditionalRules && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Conditional Rules</h4>
                      <div className="text-sm text-gray-600">
                        {rule.conditionalRules.type === 'percentage' && (
                          <span>Approved if {rule.conditionalRules.value}% of approvers approve</span>
                        )}
                        {rule.conditionalRules.type === 'specific' && (
                          <span>Auto-approved if specific approver approves</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(rule.id)}
                    className={`btn btn-sm ${
                      rule.active ? 'btn-outline' : 'btn-primary'
                    }`}
                  >
                    {rule.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(rule)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit rule"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete rule"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {rules.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No approval rules</h3>
          <p className="text-gray-500 mb-4">
            Create your first approval rule to define how expenses are processed
          </p>
          <button
            onClick={handleCreate}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </button>
        </div>
      )}

      {/* Rule Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal max-w-4xl">
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedRule ? 'Edit Approval Rule' : 'Create Approval Rule'}
              </h2>
              <button 
                onClick={() => setShowForm(false)} 
                className="modal-close"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Rule configuration form will be implemented here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalRules;
