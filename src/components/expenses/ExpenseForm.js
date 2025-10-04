import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useExpense } from '../../contexts/ExpenseContext';
import { useCompany } from '../../contexts/CompanyContext';
import { externalAPIs } from '../../services/api';
import { 
  Upload, 
  Camera, 
  X, 
  DollarSign, 
  Calendar, 
  FileText,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const ExpenseForm = ({ expense, onClose, onSuccess }) => {
  const { submitExpense, updateExpense, processOCR } = useExpense();
  const { company } = useCompany();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});
  const [selectedCurrency, setSelectedCurrency] = useState(company?.currency || 'USD');
  const [convertedAmount, setConvertedAmount] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: expense || {
      description: '',
      amount: '',
      currency: company?.currency || 'USD',
      category: '',
      date: new Date().toISOString().split('T')[0],
      receipt: null
    }
  });

  const watchedAmount = watch('amount');
  const watchedCurrency = watch('currency');

  // Load exchange rates when component mounts
  useEffect(() => {
    loadExchangeRates();
  }, []);

  // Update converted amount when amount or currency changes
  useEffect(() => {
    if (watchedAmount && watchedCurrency && exchangeRates[watchedCurrency]) {
      const rate = exchangeRates[watchedCurrency];
      const converted = parseFloat(watchedAmount) * rate;
      setConvertedAmount(converted);
    }
  }, [watchedAmount, watchedCurrency, exchangeRates]);

  const loadExchangeRates = async () => {
    try {
      const response = await externalAPIs.getExchangeRates(company?.currency || 'USD');
      setExchangeRates(response.data.rates);
    } catch (error) {
      console.error('Failed to load exchange rates:', error);
    }
  };

  const handleFileUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setReceiptFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const handleOCRProcess = async () => {
    if (!receiptFile) {
      toast.error('Please select a receipt image first');
      return;
    }

    setUploading(true);
    try {
      const result = await processOCR(receiptFile);
      
      if (result.success) {
        // Auto-fill form with OCR data
        if (result.data.amount) setValue('amount', result.data.amount);
        if (result.data.description) setValue('description', result.data.description);
        if (result.data.category) setValue('category', result.data.category);
        if (result.data.date) setValue('date', result.data.date);
        if (result.data.currency) setValue('currency', result.data.currency);
        
        toast.success('Receipt processed successfully!');
      } else {
        toast.error('Failed to process receipt. Please fill manually.');
      }
    } catch (error) {
      console.error('OCR processing failed:', error);
      toast.error('Failed to process receipt. Please fill manually.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const expenseData = {
        ...data,
        amount: parseFloat(data.amount),
        receipt: receiptFile,
        convertedAmount: convertedAmount,
        baseCurrency: company?.currency || 'USD'
      };

      let result;
      if (expense) {
        result = await updateExpense(expense.id, expenseData);
      } else {
        result = await submitExpense(expenseData);
      }

      if (result.success) {
        toast.success(expense ? 'Expense updated successfully!' : 'Expense submitted successfully!');
        onSuccess?.(result.expense);
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

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-2xl">
        <div className="modal-header">
          <h2 className="modal-title">
            {expense ? 'Edit Expense' : 'Submit New Expense'}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-body">
          {/* Receipt Upload Section */}
          <div className="mb-6">
            <label className="form-label">Receipt (Optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {previewUrl ? (
                <div className="space-y-4">
                  <img 
                    src={previewUrl} 
                    alt="Receipt preview" 
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <div className="flex justify-center space-x-2">
                    <button
                      type="button"
                      onClick={handleOCRProcess}
                      disabled={uploading}
                      className="btn btn-primary"
                    >
                      {uploading ? (
                        <div className="loading"></div>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Process with OCR
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptFile(null);
                        setPreviewUrl(null);
                      }}
                      className="btn btn-outline"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload receipt image for automatic processing</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label
                    htmlFor="receipt-upload"
                    className="btn btn-outline cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Description */}
            <div className="md:col-span-2">
              <label className="form-label">Description *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('description', { required: 'Description is required' })}
                  className="form-input pl-10"
                  placeholder="Enter expense description"
                />
              </div>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Amount and Currency */}
            <div>
              <label className="form-label">Amount *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('amount', { 
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than 0' }
                  })}
                  type="number"
                  step="0.01"
                  className="form-input pl-10"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Currency</label>
              <select
                {...register('currency')}
                className="form-select"
                onChange={(e) => setSelectedCurrency(e.target.value)}
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

            {/* Category */}
            <div>
              <label className="form-label">Category *</label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="form-select"
              >
                <option value="">Select category</option>
                <option value="Travel">Travel</option>
                <option value="Meals">Meals</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Transportation">Transportation</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Training">Training</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="form-label">Date *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('date', { required: 'Date is required' })}
                  type="date"
                  className="form-input pl-10"
                />
              </div>
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Currency Conversion Info */}
          {watchedCurrency !== (company?.currency || 'USD') && convertedAmount > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">
                  Converted to company currency: {formatCurrency(convertedAmount, company?.currency || 'USD')}
                </span>
              </div>
            </div>
          )}

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
                expense ? 'Update Expense' : 'Submit Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
