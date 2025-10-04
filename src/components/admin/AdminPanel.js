import React, { useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Settings, 
  DollarSign, 
  FileText, 
  CheckCircle,
  TrendingUp,
  Building,
  Globe
} from 'lucide-react';
import EmployeeManagement from './EmployeeManagement';
import ApprovalRules from './ApprovalRules';
import CompanySettings from './CompanySettings';
import AdminDashboard from './AdminDashboard';

const AdminPanel = () => {
  const { company, employees } = useCompany();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
    { id: 'employees', name: 'Employees', icon: Users },
    { id: 'approval-rules', name: 'Approval Rules', icon: CheckCircle },
    { id: 'company', name: 'Company Settings', icon: Building },
  ];

  const getStats = () => {
    const totalEmployees = employees.length;
    const managers = employees.filter(emp => emp.role === 'manager').length;
    const regularEmployees = employees.filter(emp => emp.role === 'employee').length;
    
    return {
      totalEmployees,
      managers,
      regularEmployees
    };
  };

  const stats = getStats();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'employees':
        return <EmployeeManagement />;
      case 'approval-rules':
        return <ApprovalRules />;
      case 'company':
        return <CompanySettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
        <p className="text-purple-100">
          Manage your company's expense management system
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
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
                <p className="text-sm font-medium text-gray-600">Managers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.managers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.regularEmployees}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Building className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Company</p>
                <p className="text-2xl font-bold text-gray-900">{company?.name || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card">
        <div className="card-body p-0">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="card">
        <div className="card-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
