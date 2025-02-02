# MediSync API Documentation

## Authentication

All API endpoints require JWT authentication except for login and register.

### Headers
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

## Endpoints

### Authentication

#### Login
```
POST /api/auth/login.php

Request:
{
    "email": "string",
    "password": "string"
}

Response:
{
    "success": boolean,
    "data": {
        "token": "string",
        "user": {
            "id": "string",
            "email": "string",
            "full_name": "string",
            "role": "string",
            "branch_id": "string"
        }
    }
}
```

### Prescriptions

#### Create Prescription
```
POST /api/admin/prescriptions/create.php

Request:
{
    "client_id": "string",
    "items": [
        {
            "product_id": "string",
            "quantity": number,
            "directions": "string"
        }
    ]
}

Response:
{
    "success": boolean,
    "message": "string",
    "data": {
        "id": "string",
        "client_id": "string",
        "referee_id": "string",
        "branch_id": "string",
        "status": "active",
        "items": [
            {
                "product_id": "string",
                "quantity": number,
                "directions": "string",
                "product_name": "string",
                "sku": "string",
                "price": number
            }
        ],
        "created_at": "string"
    }
}
```

#### Search Prescriptions
```
GET /api/admin/prescriptions/search.php

Query Parameters:
- client_id (optional)
- referee_id (optional)
- branch_id (optional)
- status (optional): "active" | "completed" | "cancelled"
- start_date (optional)
- end_date (optional)

Response:
{
    "success": boolean,
    "data": [
        {
            "id": "string",
            "client_name": "string",
            "referee_name": "string",
            "branch_name": "string",
            "status": "string",
            "items": [
                {
                    "product_name": "string",
                    "quantity": number,
                    "directions": "string"
                }
            ],
            "created_at": "string"
        }
    ]
}
```

#### Complete Prescription
```
POST /api/admin/prescriptions/complete.php

Request:
{
    "id": "string",
    "sale_id": "string"
}

Response:
{
    "success": boolean,
    "message": "string",
    "data": {
        "id": "string",
        "status": "completed",
        "updated_at": "string"
    }
}
```

### Settings

#### Get Settings
```
GET /api/admin/settings/get.php

Response:
{
    "success": boolean,
    "data": {
        "referee_commission_percentage": number,
        "vat_percentage": number
    }
}
```

#### Update Settings
```
POST /api/admin/settings/update.php

Request:
{
    "referee_commission_percentage": number,
    "vat_percentage": number
}

Response:
{
    "success": boolean,
    "message": "string",
    "data": {
        "referee_commission_percentage": number,
        "vat_percentage": number,
        "updated_at": "string"
    }
}
```

#### Get Commission History
```
GET /api/admin/settings/commission-history.php

Query Parameters:
- referee_id (optional)
- start_date (optional)
- end_date (optional)

Response:
{
    "success": boolean,
    "data": {
        "history": [
            {
                "id": "string",
                "referee_name": "string",
                "sale_amount": number,
                "amount": number,
                "commission_percentage": number,
                "status": "pending" | "paid",
                "created_at": "string",
                "paid_at": "string"
            }
        ],
        "totals": {
            "total_sales": number,
            "total_commission": number,
            "pending_commission": number,
            "paid_commission": number
        }
    }
}
```

#### Get Referee Statistics
```
GET /api/admin/settings/referee-stats.php

Query Parameters:
- referee_id (required)

Response:
{
    "success": boolean,
    "data": {
        "total_sales": number,
        "total_sales_amount": number,
        "total_commission": number,
        "total_prescriptions": number,
        "completed_prescriptions": number,
        "active_prescriptions": number,
        "total_clients": number,
        "pending_commission": number,
        "paid_commission": number,
        "conversion_rate": number,
        "average_commission": number,
        "current_commission_rate": number,
        "monthly_trends": [
            {
                "month": "string",
                "sales_count": number,
                "sales_amount": number,
                "commission_amount": number
            }
        ]
    }
}
```

### Clients

#### Search Clients
```
GET /api/clients/search.php

Query Parameters:
- search: string (name, phone, or email)

Response:
{
    "success": boolean,
    "data": [
        {
            "id": "string",
            "full_name": "string",
            "email": "string",
            "phone": "string",
            "address": "string"
        }
    ]
}
```

#### Create Client
```
POST /api/clients/create.php

Request:
{
    "full_name": "string",
    "email": "string" (optional),
    "phone": "string" (optional),
    "address": "string" (optional)
}

Response:
{
    "success": boolean,
    "message": "string",
    "data": {
        "id": "string",
        "full_name": "string",
        "email": "string",
        "phone": "string",
        "address": "string",
        "created_at": "string"
    }
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
    "success": false,
    "message": "Error message describing the issue",
    "errors": ["Array of specific validation errors"] (optional)
}
```

### 401 Unauthorized
```json
{
    "success": false,
    "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
    "success": false,
    "message": "Access denied. Insufficient permissions."
}
```

### 500 Internal Server Error
```json
{
    "success": false,
    "message": "An unexpected error occurred"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 60 requests per minute per IP address
- Exceeded limits will return a 429 Too Many Requests response

## Best Practices

1. Always validate input before sending to the API
2. Handle error responses appropriately
3. Implement token refresh mechanism
4. Use appropriate content types
5. Include error handling for network issues
6. Cache responses when appropriate
7. Use pagination for large datasets
8. Implement retry logic for failed requests

## Testing

Test endpoints are available for development:
- Use test database
- Test credentials provided
- Sandbox environment for payments

## Support

For API support:
1. Check error logs
2. Review documentation
3. Contact system administrator
