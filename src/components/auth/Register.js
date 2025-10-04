import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Building, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    country: '',
    currency: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Load countries and currencies on component mount
  React.useEffect(() => {
    loadCountriesAndCurrencies();
  }, []);

  const loadCountriesAndCurrencies = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
      const data = await response.json();
      
      const countryList = data.map(country => ({
        name: country.name.common,
        code: country.name.common,
        currencies: country.currencies ? Object.keys(country.currencies) : []
      }));
      
      setCountries(countryList);
    } catch (error) {
      console.error('Failed to load countries:', error);
      toast.error('Failed to load countries');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update currencies when country changes
    if (name === 'country') {
      const selectedCountry = countries.find(c => c.name === value);
      if (selectedCountry) {
        setCurrencies(selectedCountry.currencies);
        setFormData(prev => ({
          ...prev,
          currency: selectedCountry.currencies[0] || ''
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        company: {
          name: formData.companyName,
          country: formData.country,
          currency: formData.currency
        }
      };

      const result = await register(userData);
      
      if (result.success) {
        toast.success('Registration successful! Welcome to Expense Management System');
        navigate('/');
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
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <div className="auth-branding">
            <h1 className="auth-app-name">Xpense Tracker</h1>
            <p className="auth-app-tagline">Smart Expense Management</p>
          </div>
          <h2 className="auth-title">
            Create your account
          </h2>
          <p className="auth-subtitle">
            Or{' '}
            <Link
              to="/login"
              className="auth-link"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section-title">Personal Information</div>
            <div className="form-grid">
              <div className="input-group">
                <label className="form-label">First Name</label>
                <div className="relative">
                  <User className="input-icon" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="form-input-with-icon"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label className="form-label">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="form-input"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="form-label">Email address</label>
              <div className="relative">
                <Mail className="input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="form-input-with-icon"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Company Information</div>
            <div className="input-group">
              <label className="form-label">Company Name</label>
              <div className="relative">
                <Building className="input-icon" />
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  className="form-input-with-icon"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="input-group">
                <label className="form-label">Country</label>
                <div className="relative">
                  <Globe className="input-icon" />
                  <select
                    id="country"
                    name="country"
                    required
                    className="form-input-with-icon"
                    value={formData.country}
                    onChange={handleChange}
                  >
                    <option value="">Select country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="form-label">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  required
                  className="form-select"
                  value={formData.currency}
                  onChange={handleChange}
                  disabled={!formData.country}
                >
                  <option value="">Select currency</option>
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <div className="form-section-title">Account Setup</div>
            <div className="input-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="form-input-with-icon"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <Lock className="input-icon" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="form-input-with-icon"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <div className="loading"></div>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;