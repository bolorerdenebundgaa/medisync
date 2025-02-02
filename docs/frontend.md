# MediSync Frontend Documentation

## Architecture Overview

The frontend is built with Angular and follows a modular architecture with:
- Standalone components
- Service-based state management
- Role-based routing
- Reactive forms
- Material Design components

## Core Components

### Prescription Management

#### PrescriptionComponent
```typescript
// src/app/components/referee/prescription.component.ts
@Component({
  selector: 'app-prescription',
  standalone: true
})
```
Handles prescription creation with:
- Client search/creation
- Product selection
- Quantity and directions input
- Prescription submission

Key Features:
- Autocomplete search for clients and products
- Dynamic form validation
- Real-time inventory checking
- Branch-specific product filtering

### Settings Management

#### SettingsManagementComponent
```typescript
// src/app/components/admin/settings-management.component.ts
@Component({
  selector: 'app-settings-management',
  standalone: true
})
```
Manages system settings:
- Commission percentage configuration
- VAT rate configuration
- Real-time calculation preview
- Form validation

## Services

### PrescriptionService
```typescript
// src/app/services/prescription.service.ts
@Injectable({
  providedIn: 'root'
})
```
Handles prescription-related API calls:
- Create prescriptions
- Search prescriptions
- Update status
- Get prescription history

Methods:
```typescript
createPrescription(prescription: PrescriptionCreateRequest): Observable<Prescription>
getPrescription(id: string): Observable<Prescription>
searchPrescriptions(params: SearchParams): Observable<Prescription[]>
completePrescription(id: string): Observable<Prescription>
```

### SettingsService
```typescript
// src/app/services/settings.service.ts
@Injectable({
  providedIn: 'root'
})
```
Manages system settings:
- Get/update settings
- Calculate commissions
- Calculate VAT
- Get commission history

Methods:
```typescript
getSettings(): Observable<Settings>
updateSettings(settings: Partial<Settings>): Observable<Settings>
calculateCommission(amount: number): Observable<number>
calculateVAT(amount: number): Observable<number>
```

### ClientService
```typescript
// src/app/services/client.service.ts
@Injectable({
  providedIn: 'root'
})
```
Handles client management:
- Search clients
- Create new clients
- Update client information
- Get client prescriptions

## Models

### Prescription Models
```typescript
// src/app/models/prescription.model.ts
export interface Prescription {
  id: string;
  client_id: string;
  referee_id: string;
  branch_id: string;
  items: PrescriptionItem[];
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface PrescriptionItem {
  product_id: string;
  quantity: number;
  directions: string;
}
```

### Settings Models
```typescript
// src/app/models/settings.model.ts
export interface Settings {
  id?: string;
  referee_commission_percentage: number;
  vat_percentage: number;
  updated_at?: string;
}
```

## Routing

```typescript
// src/app/app.routes.ts
const routes: Routes = [
  {
    path: 'referee/prescriptions',
    component: PrescriptionComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['referee'] }
  },
  {
    path: 'admin/settings',
    component: SettingsManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  }
];
```

## Guards

### RoleGuard
```typescript
// src/app/guards/role.guard.ts
@Injectable({
  providedIn: 'root'
})
```
Protects routes based on user roles:
- Checks user permissions
- Redirects unauthorized access
- Handles role-based routing

## Interceptors

### AuthInterceptor
```typescript
// src/app/interceptors/auth.interceptor.ts
@Injectable()
```
Handles authentication:
- Adds JWT token to requests
- Refreshes expired tokens
- Handles 401/403 responses

## Error Handling

### ErrorHandlingService
```typescript
// src/app/services/error-handling.service.ts
@Injectable({
  providedIn: 'root'
})
```
Centralizes error handling:
- API error processing
- User-friendly messages
- Error logging
- Retry logic

## State Management

The application uses service-based state management:
- Services maintain state
- Components subscribe to services
- RxJS for reactive updates
- Local storage for persistence

## Best Practices

1. Component Organization:
   - Standalone components
   - Feature modules
   - Shared modules
   - Lazy loading

2. Service Design:
   - Single responsibility
   - Injectable services
   - State management
   - Error handling

3. Form Handling:
   - Reactive forms
   - Form validation
   - Error messages
   - Dynamic forms

4. Performance:
   - Lazy loading
   - Change detection
   - Memoization
   - Virtual scrolling

5. Security:
   - Input validation
   - XSS prevention
   - CSRF protection
   - Secure storage

## Testing

1. Unit Tests:
   ```bash
   ng test
   ```
   - Component tests
   - Service tests
   - Guard tests
   - Pipe tests

2. E2E Tests:
   ```bash
   ng e2e
   ```
   - User flows
   - Integration tests
   - UI tests

## Build & Deployment

1. Development:
   ```bash
   ng serve
   ```

2. Production:
   ```bash
   ng build --prod
   ```

3. Environment Configuration:
   - src/environments/environment.ts
   - src/environments/environment.prod.ts

## Support

For frontend development support:
1. Check Angular documentation
2. Review component documentation
3. Contact development team
