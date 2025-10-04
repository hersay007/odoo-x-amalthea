import React, { useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  User,
  Mail,
  Phone,
  Building,
  UserCheck
} from 'lucide-react';
import EmployeeForm from './EmployeeForm';
import toast from 'react-hot-toast';

const EmployeeManagement = () => {
  const { employees, managers, createEmployee, updateEmployee, deleteEmployee } = useCompany();
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [filteredEmployees, setFilteredEmployees] = useState(employees);

  React.useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, roleFilter]);

  const filterEmployees = () => {
    let filtered = [...employees];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(emp => emp.role === roleFilter);
    }

    setFilteredEmployees(filtered);
  };

  const handleCreate = () => {
    setSelectedEmployee(null);
    setShowForm(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const result = await deleteEmployee(employeeId);
      if (result.success) {
        toast.success('Employee deleted successfully');
      } else {
        toast.error(result.error);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { class: 'badge-danger', text: 'Admin' },
      manager: { class: 'badge-warning', text: 'Manager' },
      employee: { class: 'badge-info', text: 'Employee' }
    };
    
    const config = roleConfig[role] || roleConfig.employee;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-gray-600">Manage your team members and their roles</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredEmployees.length} of {employees.length} employees
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Employees List */}
      <div className="card">
        <div className="card-body p-0">
          {filteredEmployees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Manager</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {getRoleBadge(employee.role)}
                      </td>
                      <td>
                        {employee.managerId ? (
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {managers.find(m => m.id === employee.managerId)?.firstName} {managers.find(m => m.id === employee.managerId)?.lastName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No manager</span>
                        )}
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {employee.email}
                          </div>
                          {employee.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {employee.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employee.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Edit employee"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {employee.role !== 'admin' && (
                            <button
                              onClick={() => handleDelete(employee.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Delete employee"
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
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || roleFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first employee'
                }
              </p>
              {(!searchTerm && roleFilter === 'all') && (
                <button
                  onClick={handleCreate}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Employee Form Modal */}
      {showForm && (
        <EmployeeForm
          employee={selectedEmployee}
          onClose={() => {
            setShowForm(false);
            setSelectedEmployee(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default EmployeeManagement;
