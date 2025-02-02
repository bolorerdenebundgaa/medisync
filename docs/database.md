# MediSync Database Documentation

## Schema Overview

The database is designed to support a medical supply chain management system with prescription and commission tracking capabilities.

## Tables

### Users and Authentication

#### users
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### roles
```sql
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### user_roles
```sql
CREATE TABLE user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    branch_id VARCHAR(36),
    assigned_by VARCHAR(36) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);
```

### Prescription Management

#### clients
```sql
CREATE TABLE clients (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### prescriptions
```sql
CREATE TABLE prescriptions (
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
```

#### prescription_items
```sql
CREATE TABLE prescription_items (
    id VARCHAR(36) PRIMARY KEY,
    prescription_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    directions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### Commission Management

#### referee_earnings
```sql
CREATE TABLE referee_earnings (
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
```

### System Settings

#### settings
```sql
CREATE TABLE settings (
    id VARCHAR(36) PRIMARY KEY,
    referee_commission_percentage DECIMAL(5,2) DEFAULT 10.00,
    vat_percentage DECIMAL(5,2) DEFAULT 15.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Relationships

### User Management
```
users 1 --- * user_roles
roles 1 --- * user_roles
branches 1 --- * user_roles
```

### Prescription Flow
```
clients 1 --- * prescriptions
users (referees) 1 --- * prescriptions
branches 1 --- * prescriptions
prescriptions 1 --- * prescription_items
products 1 --- * prescription_items
```

### Commission Flow
```
users (referees) 1 --- * referee_earnings
sales 1 --- * referee_earnings
```

## Indexes

### Performance Indexes
```sql
CREATE INDEX idx_prescriptions_client ON prescriptions(client_id);
CREATE INDEX idx_prescriptions_referee ON prescriptions(referee_id);
CREATE INDEX idx_prescriptions_branch ON prescriptions(branch_id);
CREATE INDEX idx_prescription_items_product ON prescription_items(product_id);
CREATE INDEX idx_referee_earnings_referee ON referee_earnings(referee_id);
CREATE INDEX idx_referee_earnings_sale ON referee_earnings(sale_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_phone ON clients(phone);
```

## Triggers

### Commission Calculation
```sql
CREATE TRIGGER after_sale_insert
AFTER INSERT ON sales
FOR EACH ROW
BEGIN
    DECLARE commission_pct DECIMAL(5,2);
    
    IF NEW.referee_id IS NOT NULL THEN
        SELECT referee_commission_percentage INTO commission_pct 
        FROM settings LIMIT 1;
        
        INSERT INTO referee_earnings (
            id, referee_id, sale_id, amount, commission_percentage
        ) VALUES (
            UUID(),
            NEW.referee_id,
            NEW.id,
            (NEW.total_amount * (commission_pct / 100)),
            commission_pct
        );
    END IF;
END;
```

## Data Types

### UUID Format
- All IDs use VARCHAR(36) to store UUID v4 values
- Generated using the `UUID()` function or application logic

### Decimal Precision
- Money values use DECIMAL(10,2) for amounts
- Percentages use DECIMAL(5,2) for rates
- Quantities use INT for whole numbers

### Timestamps
- All timestamps use MySQL TIMESTAMP type
- Automatic update of updated_at fields
- NULL allowed for optional dates (e.g., paid_at)

## Best Practices

1. Transaction Management
   - Use transactions for multi-table operations
   - Ensure data consistency
   - Proper error handling and rollback

2. Data Integrity
   - Foreign key constraints
   - Unique constraints
   - Not null constraints
   - Default values

3. Performance
   - Proper indexing
   - Query optimization
   - Regular maintenance
   - Monitoring and tuning

4. Security
   - Password hashing
   - Input validation
   - Access control
   - Audit logging

## Maintenance

1. Regular Tasks
   ```sql
   -- Optimize tables
   OPTIMIZE TABLE users, prescriptions, referee_earnings;
   
   -- Analyze tables
   ANALYZE TABLE users, prescriptions, referee_earnings;
   
   -- Update statistics
   ANALYZE TABLE users, prescriptions, referee_earnings;
   ```

2. Backup Strategy
   ```bash
   # Daily backup
   mysqldump -u username -p medisync > backup_$(date +%Y%m%d).sql
   
   # Specific tables backup
   mysqldump -u username -p medisync users roles user_roles > users_backup.sql
   ```

## Support

For database support:
1. Check error logs
2. Review documentation
3. Contact database administrator
