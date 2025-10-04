import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CompanyProvider } from './contexts/CompanyContext';
import { ExpenseProvider } from './contexts/ExpenseContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ExpenseList from './components/expenses/ExpenseList';
import ApprovalList from './components/approvals/ApprovalList';
import AdminPanel from './components/admin/AdminPanel';
import { initializeSampleData } from './utils/sampleData';
import './App.css';

// Initialize sample data for demo
initializeSampleData();

function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <ExpenseProvider>
          <Router>
            <div className="App">
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/expenses" element={
                  <ProtectedRoute>
                    <Layout>
                      <ExpenseList />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/approvals" element={
                  <ProtectedRoute requiredRoles={['admin', 'manager']}>
                    <Layout>
                      <ApprovalList />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <AdminPanel />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </ExpenseProvider>
      </CompanyProvider>
    </AuthProvider>
  );
}

export default App;
