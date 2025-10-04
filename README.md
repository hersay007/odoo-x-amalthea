# Expense Management System

A comprehensive expense management system built with React that streamlines expense submission, approval workflows, and administrative controls.

## Features

### 🔐 Authentication & User Management
- User registration and login
- Role-based access control (Admin, Manager, Employee)
- Company auto-creation with country/currency selection
- Employee management with manager assignments

### 💰 Expense Management
- Submit expense claims with multi-currency support
- Receipt upload with OCR processing
- Expense categorization and filtering
- Real-time currency conversion
- Expense history and status tracking

### ✅ Approval Workflow
- Multi-level approval system
- Sequential and conditional approval rules
- Manager and admin approval capabilities
- Approval history tracking
- Comments and rejection reasons

### 🏢 Admin Panel
- Company settings and configuration
- Employee management
- Approval rule configuration
- System analytics and reporting
- User role management

### 📱 Modern UI/UX
- Responsive design for all devices
- Intuitive navigation and user experience
- Real-time notifications
- Modern card-based layout
- Dark/light theme support

## Technology Stack

- **Frontend**: React 18, React Router, React Hook Form
- **Styling**: Custom CSS with modern design system
- **State Management**: React Context API
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **OCR**: Tesseract.js (mock implementation)
- **APIs**: REST Countries API, Exchange Rate API

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd expense-management-system
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── expenses/       # Expense management components
│   ├── approvals/      # Approval workflow components
│   ├── admin/          # Admin panel components
│   └── Layout.js       # Main layout component
├── contexts/           # React Context providers
├── services/           # API and external services
└── App.js             # Main application component
```

## Key Components

### Authentication
- **Login**: User authentication with email/password
- **Register**: New user registration with company creation
- **ProtectedRoute**: Route protection based on user roles

### Expense Management
- **ExpenseForm**: Submit and edit expense claims
- **ExpenseList**: View and manage expense submissions
- **ExpenseDetails**: Detailed expense information and approval history

### Approval System
- **ApprovalList**: Review pending expense approvals
- **ApprovalDetails**: Detailed approval interface with comments
- **ApprovalRules**: Configure approval workflows

### Admin Panel
- **AdminDashboard**: System overview and analytics
- **EmployeeManagement**: Manage team members and roles
- **CompanySettings**: Configure company information and policies

## Features in Detail

### Multi-Currency Support
- Automatic currency conversion using Exchange Rate API
- Support for major world currencies
- Company default currency setting

### OCR Receipt Processing
- Upload receipt images for automatic data extraction
- Mock OCR implementation (easily replaceable with real OCR service)
- Auto-fill expense forms with extracted data

### Approval Workflows
- **Sequential**: Approvals must happen in order
- **Conditional**: Percentage-based or specific approver rules
- **Hybrid**: Combination of sequential and conditional rules

### Role-Based Access
- **Admin**: Full system access, user management, company settings
- **Manager**: Approve expenses, view team expenses, manage team
- **Employee**: Submit expenses, view own expenses

## API Integration

The system integrates with external APIs:
- **REST Countries API**: For country and currency selection
- **Exchange Rate API**: For real-time currency conversion

## Customization

### Adding New Expense Categories
Update the categories array in `ExpenseContext.js`:
```javascript
const [categories, setCategories] = useState([
  'Travel', 'Meals', 'Office Supplies', // ... add new categories
]);
```

### Modifying Approval Rules
Update the approval rules in the admin panel or modify the default rules in `ApprovalRules.js`.

### Styling
The application uses a custom CSS design system. Modify `src/index.css` and `src/App.css` for styling changes.

## Future Enhancements

- [ ] Real OCR integration with cloud services
- [ ] Mobile app development
- [ ] Advanced reporting and analytics
- [ ] Integration with accounting software
- [ ] Email notifications
- [ ] Bulk expense upload
- [ ] Advanced approval workflows
- [ ] API for third-party integrations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
