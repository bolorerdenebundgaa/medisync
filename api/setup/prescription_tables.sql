-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(36) NOT NULL,
    referee_id VARCHAR(36) NOT NULL,
    branch_id VARCHAR(36) NOT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (referee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- Prescription items table
CREATE TABLE IF NOT EXISTS prescription_items (
    id VARCHAR(36) PRIMARY KEY,
    prescription_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    directions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Sales table update for referee tracking
ALTER TABLE sales ADD COLUMN referee_id VARCHAR(36) NULL;
ALTER TABLE sales ADD FOREIGN KEY (referee_id) REFERENCES users(id);

-- Add commission and VAT columns to settings table
ALTER TABLE settings ADD COLUMN referee_commission_percentage DECIMAL(5,2) DEFAULT 10.00;
ALTER TABLE settings ADD COLUMN vat_percentage DECIMAL(5,2) DEFAULT 15.00;

-- Referee earnings table
CREATE TABLE IF NOT EXISTS referee_earnings (
    id VARCHAR(36) PRIMARY KEY,
    referee_id VARCHAR(36) NOT NULL,
    sale_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    commission_percentage DECIMAL(5,2) NOT NULL,
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (referee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX idx_prescriptions_client ON prescriptions(client_id);
CREATE INDEX idx_prescriptions_referee ON prescriptions(referee_id);
CREATE INDEX idx_prescriptions_branch ON prescriptions(branch_id);
CREATE INDEX idx_prescription_items_product ON prescription_items(product_id);
CREATE INDEX idx_referee_earnings_referee ON referee_earnings(referee_id);
CREATE INDEX idx_referee_earnings_sale ON referee_earnings(sale_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_phone ON clients(phone);

-- Add triggers for automatic earnings calculation
DELIMITER //

CREATE TRIGGER after_sale_insert
AFTER INSERT ON sales
FOR EACH ROW
BEGIN
    DECLARE commission_pct DECIMAL(5,2);
    
    IF NEW.referee_id IS NOT NULL THEN
        -- Get current commission percentage from settings
        SELECT referee_commission_percentage INTO commission_pct 
        FROM settings 
        LIMIT 1;
        
        -- Calculate and insert referee earnings
        INSERT INTO referee_earnings (
            id,
            referee_id,
            sale_id,
            amount,
            commission_percentage
        ) VALUES (
            UUID(),
            NEW.referee_id,
            NEW.id,
            (NEW.total_amount * (commission_pct / 100)),
            commission_pct
        );
    END IF;
END//

DELIMITER ;
