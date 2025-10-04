import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Mock user data for demo
          const userData = JSON.parse(localStorage.getItem('userData') || 'null');
          setUser(userData);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      // Mock login - check if user exists in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        const token = 'mock-token-' + Date.now();
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(user));
        setToken(token);
        setUser(user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Invalid email or password' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      // Mock registration - store user in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user already exists
      if (users.find(u => u.email === userData.email)) {
        return { 
          success: false, 
          error: 'User with this email already exists' 
        };
      }

      const newUser = {
        id: Date.now(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        role: 'admin', // First user becomes admin
        company: userData.company,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Create company data
      const companyData = {
        id: Date.now(),
        name: userData.company.name,
        country: userData.company.country,
        currency: userData.company.currency,
        adminId: newUser.id,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('companyData', JSON.stringify(companyData));

      const token = 'mock-token-' + Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(newUser));
      setToken(token);
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
