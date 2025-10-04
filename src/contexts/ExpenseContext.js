import React, { createContext, useContext, useState, useEffect } from 'react';
import { processReceiptOCR } from '../services/ocrService';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext();

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([
    'Travel',
    'Meals',
    'Office Supplies',
    'Transportation',
    'Accommodation',
    'Entertainment',
    'Training',
    'Other'
  ]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadExpenseData();
    }
  }, [isAuthenticated, user]);

  const loadExpenseData = async () => {
    try {
      setLoading(true);
      
      // Load expenses from localStorage
      const expensesData = JSON.parse(localStorage.getItem('expenses') || '[]');
      const approvalsData = expensesData.filter(exp => exp.status === 'pending');
      
      setExpenses(expensesData);
      setPendingApprovals(approvalsData);
    } catch (error) {
      console.error('Failed to load expense data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitExpense = async (expenseData) => {
    try {
      const newExpense = {
        id: Date.now(),
        ...expenseData,
        userId: user.id,
        user: user,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      expenses.unshift(newExpense);
      localStorage.setItem('expenses', JSON.stringify(expenses));
      
      setExpenses(prev => [newExpense, ...prev]);
      setPendingApprovals(prev => [newExpense, ...prev]);
      
      return { success: true, expense: newExpense };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to submit expense' 
      };
    }
  };

  const updateExpense = async (expenseId, updateData) => {
    try {
      const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      const updatedExpense = {
        ...expenses.find(exp => exp.id === expenseId),
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      const updatedExpenses = expenses.map(exp => 
        exp.id === expenseId ? updatedExpense : exp
      );
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      
      setExpenses(prev => 
        prev.map(exp => exp.id === expenseId ? updatedExpense : exp)
      );
      
      return { success: true, expense: updatedExpense };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to update expense' 
      };
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      const updatedExpenses = expenses.filter(exp => exp.id !== expenseId);
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      
      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
      setPendingApprovals(prev => prev.filter(exp => exp.id !== expenseId));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to delete expense' 
      };
    }
  };

  const approveExpense = async (expenseId, comments = '') => {
    try {
      const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      const updatedExpense = {
        ...expenses.find(exp => exp.id === expenseId),
        status: 'approved',
        approvedBy: user,
        approvedAt: new Date().toISOString(),
        approvalComments: comments
      };
      
      const updatedExpenses = expenses.map(exp => 
        exp.id === expenseId ? updatedExpense : exp
      );
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      
      // Update expense status
      setExpenses(prev => 
        prev.map(exp => 
          exp.id === expenseId ? updatedExpense : exp
        )
      );
      
      // Remove from pending approvals
      setPendingApprovals(prev => prev.filter(exp => exp.id !== expenseId));
      
      return { success: true, result: updatedExpense };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to approve expense' 
      };
    }
  };

  const rejectExpense = async (expenseId, comments = '') => {
    try {
      const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      const updatedExpense = {
        ...expenses.find(exp => exp.id === expenseId),
        status: 'rejected',
        rejectedBy: user,
        rejectedAt: new Date().toISOString(),
        rejectionReason: comments
      };
      
      const updatedExpenses = expenses.map(exp => 
        exp.id === expenseId ? updatedExpense : exp
      );
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      
      // Update expense status
      setExpenses(prev => 
        prev.map(exp => 
          exp.id === expenseId ? updatedExpense : exp
        )
      );
      
      // Remove from pending approvals
      setPendingApprovals(prev => prev.filter(exp => exp.id !== expenseId));
      
      return { success: true, result: updatedExpense };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to reject expense' 
      };
    }
  };

  const getExpensesByStatus = (status) => {
    return expenses.filter(exp => exp.status === status);
  };

  const getExpensesByUser = (userId) => {
    return expenses.filter(exp => exp.userId === userId);
  };

  const getExpensesByCategory = (category) => {
    return expenses.filter(exp => exp.category === category);
  };

  const getExpensesByDateRange = (startDate, endDate) => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startDate && expDate <= endDate;
    });
  };

  const getTotalExpenses = (expenseList = expenses) => {
    return expenseList.reduce((total, exp) => total + exp.amount, 0);
  };

  const getExpensesStats = () => {
    const total = expenses.length;
    const approved = expenses.filter(exp => exp.status === 'approved').length;
    const pending = expenses.filter(exp => exp.status === 'pending').length;
    const rejected = expenses.filter(exp => exp.status === 'rejected').length;
    
    return {
      total,
      approved,
      pending,
      rejected,
      approvalRate: total > 0 ? (approved / total) * 100 : 0
    };
  };

  const addCategory = (newCategory) => {
    if (!categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
    }
  };

  const processOCR = async (file) => {
    try {
      const result = await processReceiptOCR(file);
      return result;
    } catch (error) {
      console.error('OCR processing failed:', error);
      return {
        success: false,
        error: 'Failed to process receipt image'
      };
    }
  };

  const value = {
    expenses,
    pendingApprovals,
    categories,
    loading,
    submitExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    getExpensesByStatus,
    getExpensesByUser,
    getExpensesByCategory,
    getExpensesByDateRange,
    getTotalExpenses,
    getExpensesStats,
    addCategory,
    processOCR,
    refreshData: loadExpenseData
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};
