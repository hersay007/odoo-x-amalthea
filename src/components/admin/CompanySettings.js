import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCompany } from '../../contexts/CompanyContext';
import { 
  Building, 
  Globe, 
  DollarSign, 
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

const CompanySettings = () => {
  const { company, updateCompany } = useCompany();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: company || {
      name: '',
      country: '',
      currency: 'USD',
      address: '',
      phone: '',
      email: '',
      website: '',
      description: ''
    }
  });

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
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await updateCompany(data);
      if (result.success) {
        toast.success('Company settings updated successfully!');
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Company Settings</h2>
        <p className="text-gray-600">Manage your company information and preferences</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Basic Information</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="form-label">Company Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('name', { required: 'Company name is required' })}
                    className="form-input pl-10"
                    placeholder="Enter company name"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Country *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    {...register('country', { required: 'Country is required' })}
                    className="form-select pl-10"
                  >
                    <option value="">Select country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.country && (
                  <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Currency *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    {...register('currency', { required: 'Currency is required' })}
                    className="form-select pl-10"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="INR">INR - Indian Rupee</option>
                  </select>
                </div>
                {errors.currency && (
                  <p className="text-red-500 text-sm mt-1">{errors.currency.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Description</label>
                <textarea
                  {...register('description')}
                  className="form-textarea"
                  rows={3}
                  placeholder="Enter company description"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Contact Information</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="form-input pl-10"
                    placeholder="Enter company email"
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
                    placeholder="Enter company phone"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Website</label>
                <input
                  {...register('website')}
                  type="url"
                  className="form-input"
                  placeholder="https://www.company.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    {...register('address')}
                    className="form-textarea pl-10"
                    rows={2}
                    placeholder="Enter company address"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Expense Settings</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <label className="form-label">Default Expense Categories</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {['Travel', 'Meals', 'Office Supplies', 'Transportation', 'Accommodation', 'Entertainment', 'Training', 'Other'].map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">Expense Approval Thresholds</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <label className="text-sm text-gray-600">Low Priority</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      defaultValue="100"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Medium Priority</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="100"
                      defaultValue="500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">High Priority</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="500"
                      defaultValue="1000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <div className="loading"></div>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanySettings;
