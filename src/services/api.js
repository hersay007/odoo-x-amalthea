import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// External APIs
export const externalAPIs = {
  getCountries: () => 
    axios.get('https://restcountries.com/v3.1/all?fields=name,currencies'),
  
  getExchangeRates: (baseCurrency) =>
    axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
};

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then(res => res.data),
  
  register: (userData) =>
    api.post('/auth/register', userData).then(res => res.data),
  
  getCurrentUser: () =>
    api.get('/auth/me').then(res => res.data),
  
  updateProfile: (userData) =>
    api.put('/auth/profile', userData).then(res => res.data),
  
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/password', { currentPassword, newPassword }).then(res => res.data)
};

// Company API
export const companyAPI = {
  getCompany: () =>
    api.get('/company').then(res => res.data),
  
  updateCompany: (companyData) =>
    api.put('/company', companyData).then(res => res.data),
  
  getEmployees: () =>
    api.get('/company/employees').then(res => res.data),
  
  createEmployee: (employeeData) =>
    api.post('/company/employees', employeeData).then(res => res.data),
  
  updateEmployee: (employeeId, employeeData) =>
    api.put(`/company/employees/${employeeId}`, employeeData).then(res => res.data),
  
  deleteEmployee: (employeeId) =>
    api.delete(`/company/employees/${employeeId}`).then(res => res.data),
  
  getApprovalRules: () =>
    api.get('/company/approval-rules').then(res => res.data),
  
  updateApprovalRules: (rules) =>
    api.put('/company/approval-rules', rules).then(res => res.data)
};

// Expense API
export const expenseAPI = {
  getExpenses: (params = {}) =>
    api.get('/expenses', { params }).then(res => res.data),
  
  getExpense: (expenseId) =>
    api.get(`/expenses/${expenseId}`).then(res => res.data),
  
  submitExpense: (expenseData) =>
    api.post('/expenses', expenseData).then(res => res.data),
  
  updateExpense: (expenseId, expenseData) =>
    api.put(`/expenses/${expenseId}`, expenseData).then(res => res.data),
  
  deleteExpense: (expenseId) =>
    api.delete(`/expenses/${expenseId}`).then(res => res.data),
  
  getPendingApprovals: () =>
    api.get('/expenses/pending-approvals').then(res => res.data),
  
  approveExpense: (expenseId, comments) =>
    api.post(`/expenses/${expenseId}/approve`, { comments }).then(res => res.data),
  
  rejectExpense: (expenseId, comments) =>
    api.post(`/expenses/${expenseId}/reject`, { comments }).then(res => res.data),
  
  getExpenseStats: (params = {}) =>
    api.get('/expenses/stats', { params }).then(res => res.data),
  
  uploadReceipt: (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return api.post('/expenses/upload-receipt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  
  processOCR: (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return api.post('/expenses/process-ocr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  }
};

// Currency API
export const currencyAPI = {
  convertCurrency: (amount, fromCurrency, toCurrency) =>
    api.post('/currency/convert', { amount, fromCurrency, toCurrency }).then(res => res.data),
  
  getSupportedCurrencies: () =>
    api.get('/currency/supported').then(res => res.data)
};

export default api;
