[Previous authentication and prescription content remains the same...]

### Products and Categories

#### List Categories
```
GET /api/admin/categories/list.php

Response:
{
    "success": boolean,
    "data": [
        {
            "id": "string",
            "name": "string",
            "description": "string",
            "parent_id": "string",
            "subcategories": [
                {
                    "id": "string",
                    "name": "string",
                    "description": "string"
                }
            ]
        }
    ]
}
```

#### Create Category
```
POST /api/admin/categories/create.php

Request:
{
    "name": "string",
    "description": "string",
    "parent_id": "string" (optional)
}

Response:
{
    "success": boolean,
    "message": "string",
    "data": {
        "id": "string",
        "name": "string",
        "description": "string",
        "parent_id": "string"
    }
}
```

#### List Products
```
GET /api/products/read.php

Query Parameters:
- category_id (optional)
- search (optional)
- page (optional)
- limit (optional)
- sort (optional): "name", "price", "created_at"
- order (optional): "asc", "desc"

Response:
{
    "success": boolean,
    "data": {
        "items": [
            {
                "id": "string",
                "sku": "string",
                "name": "string",
                "description": "string",
                "category_id": "string",
                "category_name": "string",
                "price": number,
                "image_url": "string",
                "is_active": boolean
            }
        ],
        "total": number,
        "page": number,
        "limit": number
    }
}
```

#### Create Product
```
POST /api/admin/products/create.php

Request:
{
    "sku": "string",
    "name": "string",
    "description": "string",
    "category_id": "string",
    "price": number,
    "image_url": "string",
    "is_active": boolean
}

Response:
{
    "success": boolean,
    "message": "string",
    "data": {
        "id": "string",
        "sku": "string",
        "name": "string",
        "description": "string",
        "category_id": "string",
        "price": number,
        "image_url": "string",
        "is_active": boolean
    }
}
```

### Inventory Management

#### Get Branch Inventory
```
GET /api/admin/inventory/branch/list.php

Query Parameters:
- branch_id (required)
- category_id (optional)
- search (optional)
- low_stock (optional): boolean

Response:
{
    "success": boolean,
    "data": [
        {
            "id": "string",
            "product_id": "string",
            "product_name": "string",
            "sku": "string",
            "quantity": number,
            "min_quantity": number,
            "max_quantity": number
        }
    ]
}
```

#### Add Stock
```
POST /api/admin/inventory/branch/add-stock.php

Request:
{
    "branch_id": "string",
    "product_id": "string",
    "quantity": number,
    "notes": "string"
}

Response:
{
    "success": boolean,
    "message": "string",
    "data": {
        "current_quantity": number,
        "transaction_id": "string"
    }
}
```

### E-commerce

#### Get Cart
```
GET /api/cart/get.php

Response:
{
    "success": boolean,
    "data": {
        "id": "string",
        "items": [
            {
                "id": "string",
                "product_id": "string",
                "product_name": "string",
                "quantity": number,
                "unit_price": number,
                "total_price": number
            }
        ],
        "subtotal": number,
        "vat_amount": number,
        "total": number
    }
}
```

#### Add to Cart
```
POST /api/cart/add.php

Request:
{
    "product_id": "string",
    "quantity": number
}

Response:
{
    "success": boolean,
    "message": "string",
    "data": {
        "cart_item_id": "string",
        "cart_total": number
    }
}
```

#### Get Wishlist
```
GET /api/wishlist/get.php

Response:
{
    "success": boolean,
    "data": [
        {
            "id": "string",
            "product_id": "string",
            "product_name": "string",
            "price": number,
            "image_url": "string",
            "added_at": "string"
        }
    ]
}
```

#### Place Order
```
POST /api/store/place-order.php

Request:
{
    "branch_id": "string",
    "shipping_address": "string",
    "payment_method": "string",
    "items": [
        {
            "product_id": "string",
            "quantity": number
        }
    ]
}

Response:
{
    "success": boolean,
    "message": "string",
    "data": {
        "order_id": "string",
        "total_amount": number,
        "payment_status": "string"
    }
}
```

### Sales Management

#### Create Sale
```
POST /api/pos/create-sale.php

Request:
{
    "branch_id": "string",
    "client_id": "string" (optional),
    "referee_id": "string" (optional),
    "prescription_id": "string" (optional),
    "items": [
        {
            "product_id": "string",
            "quantity": number,
            "unit_price": number
        }
    ],
    "payment_method": "string"
}

Response:
{
    "success": boolean,
    "message": "string",
    "data": {
        "sale_id": "string",
        "subtotal": number,
        "vat_amount": number,
        "total_amount": number,
        "payment_status": "string",
        "receipt_url": "string"
    }
}
```

[Previous error responses and best practices content remains the same...]
