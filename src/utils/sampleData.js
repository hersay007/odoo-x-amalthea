// Sample data for demo purposes
export const initializeSampleData = () => {
  // Check if data already exists
  if (localStorage.getItem('sampleDataInitialized')) {
    return;
  }

  // Sample expenses
  const sampleExpenses = [
    {
      id: 1,
      description: 'Client lunch meeting',
      amount: 85.50,
      currency: 'USD',
      category: 'Meals',
      date: '2024-01-15',
      status: 'approved',
      userId: 1,
      user: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'admin'
      },
      approvedBy: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe'
      },
      approvedAt: '2024-01-16T10:30:00Z',
      createdAt: '2024-01-15T14:20:00Z'
    },
    {
      id: 2,
      description: 'Office supplies - printer paper',
      amount: 45.99,
      currency: 'USD',
      category: 'Office Supplies',
      date: '2024-01-14',
      status: 'pending',
      userId: 2,
      user: {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: 'employee'
      },
      createdAt: '2024-01-14T09:15:00Z'
    },
    {
      id: 3,
      description: 'Taxi to airport',
      amount: 32.00,
      currency: 'USD',
      category: 'Transportation',
      date: '2024-01-13',
      status: 'rejected',
      userId: 3,
      user: {
        id: 3,
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike@example.com',
        role: 'employee'
      },
      rejectedBy: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe'
      },
      rejectedAt: '2024-01-14T11:45:00Z',
      rejectionReason: 'Personal travel, not business related',
      createdAt: '2024-01-13T16:30:00Z'
    }
  ];

  // Sample employees
  const sampleEmployees = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'admin',
      department: 'Management',
      position: 'CEO',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      role: 'manager',
      managerId: 1,
      department: 'Finance',
      position: 'Finance Manager',
      status: 'active',
      createdAt: '2024-01-02T00:00:00Z'
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@example.com',
      role: 'employee',
      managerId: 2,
      department: 'Sales',
      position: 'Sales Representative',
      status: 'active',
      createdAt: '2024-01-03T00:00:00Z'
    }
  ];

  // Store sample data
  localStorage.setItem('expenses', JSON.stringify(sampleExpenses));
  localStorage.setItem('employees', JSON.stringify(sampleEmployees));
  localStorage.setItem('sampleDataInitialized', 'true');
};

export const clearSampleData = () => {
  localStorage.removeItem('expenses');
  localStorage.removeItem('employees');
  localStorage.removeItem('users');
  localStorage.removeItem('companyData');
  localStorage.removeItem('sampleDataInitialized');
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
};
