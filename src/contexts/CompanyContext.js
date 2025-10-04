import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCompanyData();
    }
  }, [isAuthenticated, user]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      
      // Load company data from localStorage
      const companyData = JSON.parse(localStorage.getItem('companyData') || 'null');
      const employeesData = JSON.parse(localStorage.getItem('employees') || '[]');
      
      setCompany(companyData);
      setEmployees(employeesData);
      
      // Filter managers from employees
      const managersList = employeesData.filter(emp => emp.role === 'manager');
      setManagers(managersList);
    } catch (error) {
      console.error('Failed to load company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData) => {
    try {
      const newEmployee = {
        id: Date.now(),
        ...employeeData,
        createdAt: new Date().toISOString()
      };
      
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      employees.push(newEmployee);
      localStorage.setItem('employees', JSON.stringify(employees));
      
      setEmployees(prev => [...prev, newEmployee]);
      
      if (newEmployee.role === 'manager') {
        setManagers(prev => [...prev, newEmployee]);
      }
      
      return { success: true, employee: newEmployee };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to create employee' 
      };
    }
  };

  const updateEmployee = async (employeeId, updateData) => {
    try {
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const updatedEmployee = {
        ...employees.find(emp => emp.id === employeeId),
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      const updatedEmployees = employees.map(emp => 
        emp.id === employeeId ? updatedEmployee : emp
      );
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      
      setEmployees(prev => 
        prev.map(emp => emp.id === employeeId ? updatedEmployee : emp)
      );
      
      // Update managers list if role changed
      if (updatedEmployee.role === 'manager') {
        setManagers(prev => {
          const exists = prev.find(m => m.id === employeeId);
          return exists 
            ? prev.map(m => m.id === employeeId ? updatedEmployee : m)
            : [...prev, updatedEmployee];
        });
      } else {
        setManagers(prev => prev.filter(m => m.id !== employeeId));
      }
      
      return { success: true, employee: updatedEmployee };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to update employee' 
      };
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      setManagers(prev => prev.filter(m => m.id !== employeeId));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to delete employee' 
      };
    }
  };

  const updateCompany = async (updateData) => {
    try {
      const updatedCompany = {
        ...company,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('companyData', JSON.stringify(updatedCompany));
      setCompany(updatedCompany);
      return { success: true, company: updatedCompany };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to update company' 
      };
    }
  };

  const getEmployeeById = (employeeId) => {
    return employees.find(emp => emp.id === employeeId);
  };

  const getManagerById = (managerId) => {
    return managers.find(m => m.id === managerId);
  };

  const getEmployeesByManager = (managerId) => {
    return employees.filter(emp => emp.managerId === managerId);
  };

  const value = {
    company,
    employees,
    managers,
    loading,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    updateCompany,
    getEmployeeById,
    getManagerById,
    getEmployeesByManager,
    refreshData: loadCompanyData
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};
