CREATE TABLE IF NOT EXISTS extracted_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES uploaded_files(id) ON DELETE CASCADE,
    description TEXT,
    amount NUMERIC(12, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    item_date DATE,
    category VARCHAR(10),
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);