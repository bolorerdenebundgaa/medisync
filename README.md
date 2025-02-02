# MediSync - Medical Store Management System

MediSync is a comprehensive medical store management system built with Angular and PHP, designed to streamline inventory management, point of sale operations, and e-commerce functionality for medical stores.

## Features

- 🏪 Store Management
  - Inventory tracking
  - Stock alerts
  - Batch operations
  - Transfer management
  - Multi-branch support

- 💊 Product Management
  - Categories
  - Stock levels
  - Pricing
  - Prescriptions
  - Image management

- 🛒 E-commerce
  - Online store
  - Shopping cart
  - Wishlist
  - Order management
  - Payment integration

- 💼 POS System
  - Quick sales
  - Receipt generation
  - Payment processing
  - Daily reports

- 👥 User Management
  - Role-based access
  - Staff management
  - Customer accounts
  - Referee system

## Tech Stack

- **Frontend**
  - Angular 17
  - Angular Material
  - TailwindCSS
  - RxJS

- **Backend**
  - PHP 8
  - MySQL
  - RESTful API

## Prerequisites

- Node.js (v18 or higher)
- PHP 8.0 or higher
- MySQL 8.0 or higher
- Composer

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/medisync.git
   cd medisync
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd api
   composer install
   ```

4. Configure environment:
   - Copy `.env.example` to `.env` and update the values
   - Copy `src/environments/environment.example.ts` to `environment.ts` and update the values

5. Set up the database:
   ```bash
   cd api/setup
   php init-db.php
   ```

6. Start development servers:
   ```bash
   # Frontend (from project root)
   npm start

   # Backend (from api directory)
   php -S localhost:8000
   ```

## Development

- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:8000/api`

### Project Structure

```
medisync/
├── src/                    # Frontend source code
│   ├── app/
│   │   ├── components/    # Angular components
│   │   ├── services/      # Angular services
│   │   ├── models/        # TypeScript interfaces
│   │   ├── core/         # Core functionality
│   │   └── shared/       # Shared modules
│   └── environments/      # Environment configurations
├── api/                   # Backend source code
│   ├── config/           # PHP configuration
│   ├── models/           # PHP model classes
│   ├── middleware/       # PHP middleware
│   └── setup/           # Database setup scripts
└── docs/                 # Documentation
```

## Testing

- Run frontend tests:
  ```bash
  npm test
  ```

- Run backend tests:
  ```bash
  cd api
  composer test
  ```

## Deployment

1. Build frontend:
   ```bash
   npm run build
   ```

2. Configure web server:
   - Point document root to `api/` directory
   - Configure URL rewriting (sample `.htaccess` provided)
   - Set up SSL certificate
   - Configure environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
