-- Expense Management System Database Schema
-- This file contains all the SQL queries needed to set up the Supabase database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');
CREATE TYPE expense_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE approval_rule_type AS ENUM ('sequential', 'conditional', 'hybrid');

-- Companies table
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    description TEXT,
    admin_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for companies admin_id
ALTER TABLE companies ADD CONSTRAINT fk_companies_admin_id 
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE;

-- Expenses table
CREATE TABLE expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    converted_amount DECIMAL(10,2),
    base_currency VARCHAR(10),
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    status expense_status DEFAULT 'pending',
    receipt_url TEXT,
    receipt_filename VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense approvals table (for tracking approval history)
CREATE TABLE expense_approvals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status expense_status NOT NULL,
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval rules table
CREATE TABLE approval_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    rule_type approval_rule_type NOT NULL,
    conditions JSONB NOT NULL, -- Store conditions as JSON
    approvers JSONB NOT NULL, -- Store approvers as JSON array
    conditional_rules JSONB, -- Store conditional rules as JSON
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense categories table (for dynamic categories)
CREATE TABLE expense_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'expense_submitted', 'expense_approved', 'expense_rejected', etc.
    related_id UUID, -- ID of related expense, user, etc.
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_manager_id ON users(manager_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_company_id ON expenses(company_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expense_approvals_expense_id ON expense_approvals(expense_id);
CREATE INDEX idx_expense_approvals_approver_id ON expense_approvals(approver_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_rules_updated_at BEFORE UPDATE ON approval_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit log trigger function
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (user_id, company_id, action, table_name, record_id, old_values, new_values)
    VALUES (
        COALESCE(NEW.user_id, OLD.user_id),
        COALESCE(NEW.company_id, OLD.company_id),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create audit triggers
CREATE TRIGGER audit_expenses AFTER INSERT OR UPDATE OR DELETE ON expenses
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Row Level Security (RLS) policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Company policies
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Admins can update their company" ON companies
    FOR UPDATE USING (admin_id = auth.uid());

-- User policies
CREATE POLICY "Users can view users in their company" ON users
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Admins can manage users in their company" ON users
    FOR ALL USING (company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Expense policies
CREATE POLICY "Users can view expenses in their company" ON expenses
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create their own expenses" ON expenses
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending expenses" ON expenses
    FOR UPDATE USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Managers can approve expenses" ON expenses
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Expense approvals policies
CREATE POLICY "Users can view expense approvals for their company" ON expense_approvals
    FOR SELECT USING (expense_id IN (
        SELECT id FROM expenses WHERE company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Managers can create expense approvals" ON expense_approvals
    FOR INSERT WITH CHECK (
        approver_id = auth.uid() AND
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Approval rules policies
CREATE POLICY "Users can view approval rules for their company" ON approval_rules
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Admins can manage approval rules" ON approval_rules
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Expense categories policies
CREATE POLICY "Users can view categories for their company" ON expense_categories
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Admins can manage categories" ON expense_categories
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Audit logs policies
CREATE POLICY "Admins can view audit logs for their company" ON audit_logs
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert default expense categories
INSERT INTO expense_categories (company_id, name, description) VALUES
    ('00000000-0000-0000-0000-000000000000', 'Travel', 'Business travel expenses'),
    ('00000000-0000-0000-0000-000000000000', 'Meals', 'Business meal expenses'),
    ('00000000-0000-0000-0000-000000000000', 'Office Supplies', 'Office supplies and equipment'),
    ('00000000-0000-0000-0000-000000000000', 'Transportation', 'Transportation expenses'),
    ('00000000-0000-0000-0000-000000000000', 'Accommodation', 'Hotel and accommodation expenses'),
    ('00000000-0000-0000-0000-000000000000', 'Entertainment', 'Client entertainment expenses'),
    ('00000000-0000-0000-0000-000000000000', 'Training', 'Training and education expenses'),
    ('00000000-0000-0000-0000-000000000000', 'Other', 'Other business expenses');

-- Create views for common queries
CREATE VIEW expense_summary AS
SELECT 
    e.id,
    e.description,
    e.amount,
    e.currency,
    e.converted_amount,
    e.base_currency,
    e.category,
    e.date,
    e.status,
    e.created_at,
    u.first_name || ' ' || u.last_name as user_name,
    u.email as user_email,
    c.name as company_name
FROM expenses e
JOIN users u ON e.user_id = u.id
JOIN companies c ON e.company_id = c.id;

CREATE VIEW pending_approvals AS
SELECT 
    e.*,
    u.first_name || ' ' || u.last_name as user_name,
    u.email as user_email,
    u.manager_id
FROM expenses e
JOIN users u ON e.user_id = u.id
WHERE e.status = 'pending';

CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.first_name || ' ' || u.last_name as full_name,
    u.email,
    u.role,
    c.name as company_name,
    COUNT(e.id) as total_expenses,
    COALESCE(SUM(CASE WHEN e.status = 'approved' THEN e.amount ELSE 0 END), 0) as approved_amount,
    COALESCE(SUM(CASE WHEN e.status = 'pending' THEN e.amount ELSE 0 END), 0) as pending_amount,
    COALESCE(SUM(CASE WHEN e.status = 'rejected' THEN e.amount ELSE 0 END), 0) as rejected_amount
FROM users u
LEFT JOIN expenses e ON u.id = e.user_id
JOIN companies c ON u.company_id = c.id
GROUP BY u.id, u.first_name, u.last_name, u.email, u.role, c.name;

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_company_id(user_uuid UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT company_id FROM users WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_expense_approvers(expense_uuid UUID)
RETURNS TABLE(approver_id UUID, approver_name TEXT, order_num INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.first_name || ' ' || u.last_name,
        (ar.approvers->>'order')::INTEGER
    FROM expenses e
    JOIN companies c ON e.company_id = c.id
    JOIN approval_rules ar ON c.id = ar.company_id
    JOIN users u ON u.id = (ar.approvers->>'id')::UUID
    WHERE e.id = expense_uuid
    AND ar.is_active = true
    ORDER BY (ar.approvers->>'order')::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to process expense approval
CREATE OR REPLACE FUNCTION process_expense_approval(
    expense_uuid UUID,
    approver_uuid UUID,
    approval_status expense_status,
    approval_comments TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    expense_record expenses%ROWTYPE;
    approver_record users%ROWTYPE;
BEGIN
    -- Get expense and approver details
    SELECT * INTO expense_record FROM expenses WHERE id = expense_uuid;
    SELECT * INTO approver_record FROM users WHERE id = approver_uuid;
    
    -- Check if user can approve this expense
    IF NOT (approver_record.role IN ('admin', 'manager') AND 
            approver_record.company_id = expense_record.company_id) THEN
        RETURN FALSE;
    END IF;
    
    -- Insert approval record
    INSERT INTO expense_approvals (expense_id, approver_id, status, comments)
    VALUES (expense_uuid, approver_uuid, approval_status, approval_comments);
    
    -- Update expense status
    UPDATE expenses 
    SET status = approval_status,
        updated_at = NOW()
    WHERE id = expense_uuid;
    
    -- Create notification for expense owner
    INSERT INTO notifications (user_id, title, message, type, related_id)
    VALUES (
        expense_record.user_id,
        'Expense ' || approval_status,
        'Your expense "' || expense_record.description || '" has been ' || approval_status,
        'expense_' || approval_status,
        expense_uuid
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
