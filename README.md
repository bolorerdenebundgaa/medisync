# MediSync - Medical Supply Chain Management System

MediSync is a comprehensive medical supply chain management system built with Angular and PHP. It provides inventory management, point of sale, prescription management, and referee commission features for medical supply businesses with multiple branches.

## System Architecture

### Frontend (Angular)

The frontend is built with Angular and uses the following key technologies:
- Angular Material for UI components
- TailwindCSS for styling
- RxJS for reactive state management

Key features are organized into modules:

1. **Authentication & Authorization**
   - Login/Register components
   - Role-based access control
   - Permission guards
   - JWT token management

2. **Inventory Management**
   - Branch-specific inventory tracking
   - Stock operations (add/remove/transfer)
   - Inventory alerts
   - Transaction history
   - Batch operations

3. **Point of Sale (POS)**
   - Quick product search
   - Cart management
   - Prescription loading
   - VAT calculation
   - Payment processing
   - Receipt generation
   - Sales history

4. **Prescription Management**
   - Client search/creation
   - Product selection with quantity
   - Directions for each item
   - Branch-specific availability
   - Status tracking
   - Prescription history

5. **Referee System**
   - Prescription writing
   - Commission tracking
   - Performance analytics
   - Monthly trends
   - Payment status

6. **User Management**
   - User CRUD operations
   - Role management
   - Branch assignments
   - Permission control
   - Password management

7. **Settings Management**
   - Commission percentage configuration
   - VAT rate configuration
   - System preferences
   - Branch settings

### Backend (PHP)

The backend uses a modular PHP architecture with:
- PDO for database operations
- JWT for authentication
- RESTful API design
- Transaction support

Key components:

1. **Database Layer**
   - MySQL database
   - Prepared statements
   - Transaction management
   - Data models

2. **API Endpoints**
   - Authentication endpoints
   - CRUD operations
   - File uploads
   - Batch processing

3. **Middleware**
   - Authentication checks
   - Permission validation
   - CORS handling
   - Request validation

## Deployment Instructions

### Prerequisites

1. Server Requirements:
   - PHP 7.4 or higher
   - MySQL 5.7 or higher
   - Node.js 14 or higher
   - Apache/Nginx web server
   - Composer (PHP package manager)
   - npm (Node package manager)

2. Required PHP Extensions:
   ```bash
   - php-mysql
   - php-json
   - php-mbstring
   - php-xml
   ```

### Database Setup

1. Create MySQL database:
   ```sql
   CREATE DATABASE medisync;
   ```

2. Import database schema:
   ```bash
   # From project root
   mysql -u your_username -p medisync < api/setup/branch_tables.sql
   mysql -u your_username -p medisync < api/setup/user_tables.sql
   mysql -u your_username -p medisync < api/setup/payment_methods.sql
   mysql -u your_username -p medisync < api/setup/prescription_tables.sql
   ```

### Backend Setup

1. Configure database connection:
   ```bash
   # Copy example config
   cp api/config/database.example.php api/config/database.php
   
   # Edit with your database credentials
   nano api/config/database.php
   ```

2. Configure environment variables:
   ```bash
   # Copy example env
   cp api/.env.example api/.env
   
   # Edit environment variables
   nano api/.env
   ```

3. Set up Apache/Nginx:
   ```apache
   # Apache (.htaccess already included)
   <Directory /var/www/html/medisync/api>
       AllowOverride All
       Require all granted
   </Directory>
   ```
   ```nginx
   # Nginx
   location /api {
       try_files $uri $uri/ /api/index.php?$query_string;
   }
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   # Development
   cp src/environments/environment.example.ts src/environments/environment.ts
   
   # Production
   cp src/environments/environment.example.ts src/environments/environment.production.ts
   ```

3. Build the application:
   ```bash
   # Development
   npm run start
   
   # Production
   npm run build
   ```

### Initial Setup

1. Access the application:
   ```
   Default admin credentials:
   Email: admin@medisync.com
   Password: password
   ```

2. Change admin password immediately after first login

3. Configure system settings:
   - Set referee commission percentage (default: 10%)
   - Set VAT percentage (default: 15%)
   - Configure branch settings
   - Set up payment methods

4. Create initial data:
   - Add branches
   - Create user accounts
   - Assign roles
   - Set up inventory

## Key Workflows

### Prescription Management

1. Referee workflow:
   - Search for existing client or create new
   - Select products from branch inventory
   - Specify quantity and directions for each item
   - Save prescription

2. POS workflow:
   - Search for client
   - Load active prescriptions
   - Process payment
   - Calculate VAT
   - Record referee commission

### Commission Management

1. Commission calculation:
   - Based on configurable percentage
   - Calculated on sale total
   - Tracked per referee
   - Status management (pending/paid)

2. Performance tracking:
   - Sales conversion rate
   - Monthly trends
   - Total earnings
   - Client acquisition

## Security Considerations

1. Always use HTTPS in production
2. Keep dependencies updated
3. Implement rate limiting
4. Use strong passwords
5. Regular security audits
6. Monitor error logs
7. Backup database regularly

## Support

For issues and support:
1. Check documentation
2. Review error logs
3. Contact system administrator

## License

This project is proprietary software. All rights reserved.
