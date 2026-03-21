CREATE TABLE IF NOT EXISTS bank_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES uploaded_files(id) ON DELETE CASCADE,
    statement_month DATE NOT NULL,
    bank_name VARCHAR(255),
    opening_balance NUMERIC(12, 2),
    closing_balance NUMERIC(12, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reconciliations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_file_id UUID REFERENCES uploaded_files(id),
    statement_id UUID REFERENCES bank_statements(id),
    status VARCHAR(50) DEFAULT 'unmatched',
    matched_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);