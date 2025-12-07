## 1. Architecture design

```mermaid
graph TD
    A[User Browser] --> B[React Frontend Application]
    B --> C[Firebase SDK]
    C --> D[Firebase Auth]
    C --> E[Firestore Database]
    C --> F[Firebase Storage]
    C --> G[Cloud Functions]
    G --> H[Stripe API]

    subgraph "Frontend Layer"
        B
    end

    subgraph "Firebase Services"
        D
        E
        F
        G
    end

    subgraph "External Services"
        H
    end
```

## 2. Technology Description

* **Frontend**: React\@18 + TypeScript + TailwindCSS\@3 + Vite

* **Initialization Tool**: vite-init

* **Backend**: Firebase (Firestore, Storage, Auth, Cloud Functions)

* **State Management**: React Context for cart state

* **Payment**: Stripe (via Cloud Functions)

* **Testing**: Jest + React Testing Library

## 3. Route definitions

| Route              | Purpose                          |
| ------------------ | -------------------------------- |
| /                  | Home page with product listing   |
| /product/:id       | Product detail page              |
| /cart              | Shopping cart page               |
| /checkout          | Checkout form and order creation |
| /order-success/:id | Order confirmation page          |
| /admin/login       | Admin authentication             |
| /admin/orders      | Admin order management           |
| /admin/products    | Admin product CRUD               |

## 4. API definitions

### 4.1 Firebase Services API

**Products Service**

```typescript
// Get all products
GET /products
Response: Product[]

// Get single product
GET /products/{id}
Response: Product

// Create product (admin only)
POST /products
Request: { name: string, description: string, price: number, stock: number, imageUrl: string }
Response: Product

// Update product (admin only)
PUT /products/{id}
Request: Partial<Product>
Response: Product

// Delete product (admin only)
DELETE /products/{id}
Response: { success: boolean }
```

**Orders Service**

```typescript
// Create order (anonymous)
POST /orders
Request: { client: ClientInfo, items: OrderItem[], total: number }
Response: Order

// Get orders (admin only)
GET /orders
Response: Order[]

// Update order status (admin only)
PATCH /orders/{id}/status
Request: { status: OrderStatus }
Response: Order
```

**Authentication Service**

```typescript
// Admin login
POST /auth/login
Request: { email: string, password: string }
Response: { user: User, token: string }

// Check admin status
GET /auth/isAdmin
Response: { isAdmin: boolean }
```

## 5. Server architecture diagram

```mermaid
graph TD
    A[Client / Frontend] --> B[Firebase SDK]
    B --> C[Firestore Security Rules]
    C --> D[Firestore Database]
    B --> E[Cloud Functions]
    E --> F[External APIs]

    subgraph "Firebase Backend"
        C
        E
    end

    subgraph "Data Layer"
        D
    end

    subgraph "External Services"
        F
    end
```

## 6. Data model

### 6.1 Data model definition

```mermaid
erDiagram
    PRODUCTS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--o{ ORDER_ITEMS : contains
    ADMINS ||--o{ PRODUCTS : manages
    ADMINS ||--o{ ORDERS : manages

    PRODUCTS {
        string id PK
        string name
        string description
        number price
        string imageUrl
        number stock
        timestamp createdAt
    }
    
    ORDERS {
        string id PK
        object client
        array items
        number total
        string status
        timestamp createdAt
    }
    
    ORDER_ITEMS {
        string productId FK
        string name
        number price
        number quantity
    }
    
    ADMINS {
        string uid PK
        string email
        string role
    }
```

### 6.2 Data Definition Language

**Products Collection**

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in cents/dirhams
  imageUrl: string;
  stock: number;
  createdAt: Timestamp;
}
```

**Orders Collection**

```typescript
interface Order {
  id: string;
  client: {
    name: string;
    phone: string;
    address: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: 'pending' | 'paid' | 'preparing' | 'shipped' | 'done';
  createdAt: Timestamp;
}
```

**Admins Collection**

```typescript
interface Admin {
  uid: string;
  email: string;
  role: 'admin';
}
```

### 6.3 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check admin status
    function isAdmin(uid) {
      return exists(/databases/$(database)/documents/admins/$(uid));
    }
    
    // Helper function to validate order data
    function validateOrder(order) {
      return order.keys().hasAll(['client', 'items', 'total', 'status', 'createdAt']) &&
             order.client is map &&
             order.items is list &&
             order.total is number &&
             order.status == 'pending';
    }
    
    // Products rules
    match /products/{product} {
      allow read: if true;
      allow write: if request.auth != null && isAdmin(request.auth.uid);
    }
    
    // Orders rules
    match /orders/{order} {
      allow create: if validateOrder(request.resource.data);
      allow read, update: if request.auth != null && isAdmin(request.auth.uid);
    }
    
    // Admins rules
    match /admins/{admin} {
      allow read: if request.auth != null && request.auth.uid == admin;
    }
  }
}
```

### 6.4 Environment Variables

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY="AIzaSyAuHwW503pTdTG3yZ65FHnXugEbkGaGXus"
VITE_FIREBASE_AUTH_DOMAIN="hamid-9f53b.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="hamid-9f53b"
VITE_FIREBASE_STORAGE_BUCKET="hamid-9f53b.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="606914981239"
VITE_FIREBASE_APP_ID="1:606914981239:web:f31bb5290eb6dd08c34572"

# Stripe Configuration (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Admin Configuration
VITE_ADMIN_EMAIL=admin@example.com
```

