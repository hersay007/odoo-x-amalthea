import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCompany } from '../../contexts/CompanyContext';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Building,
  UserCheck,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

const EmployeeForm = ({ employee, onClose, onSuccess }) => {
  const { createEmployee, updateEmployee, managers } = useCompany();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: employee || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'employee',
      managerId: '',
      department: '',
      position: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let result;
      if (employee) {
        result = await updateEmployee(employee.id, data);
      } else {
        result = await createEmployee(data);
      }

      if (result.success) {
        toast.success(employee ? 'Employee updated successfully!' : 'Employee created successfully!');
        onSuccess?.(result.employee);
        onClose?.();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-2xl">
        <div className="modal-header">
          <h2 className="modal-title">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-body">
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">First Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      className="form-input pl-10"
                      placeholder="Enter first name"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Last Name *</label>
                  <input
                    {...register('lastName', { required: 'Last name is required' })}
                    className="form-input"
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Email *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="form-input pl-10"
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="form-input pl-10"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Work Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Role *</label>
                  <select
                    {...register('role', { required: 'Role is required' })}
                    className="form-select"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Manager</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCheck className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      {...register('managerId')}
                      className="form-select pl-10"
                    >
                      <option value="">Select manager (optional)</option>
                      {managers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.firstName} {manager.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Department</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('department')}
                      className="form-input pl-10"
                      placeholder="Enter department"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Position</label>
                  <input
                    {...register('position')}
                    className="form-input"
                    placeholder="Enter job title"
                  />
                </div>
              </div>
            </div>

            {/* Password (only for new employees) */}
            {!employee && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Setup</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Password *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('password', { 
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        })}
                        type="password"
                        className="form-input pl-10"
                        placeholder="Enter password"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Confirm Password *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('confirmPassword', { 
                          required: 'Please confirm password',
                          validate: (value, formValues) => 
                            value === formValues.password || 'Passwords do not match'
                        })}
                        type="password"
                        className="form-input pl-10"
                        placeholder="Confirm password"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <div className="loading"></div>
              ) : (
                employee ? 'Update Employee' : 'Create Employee'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
