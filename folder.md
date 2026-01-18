Below is a **clear, structured explanation of the frontend, backend, and database structure** for your project.
No code. Only architecture, responsibility, and flow.

---

# 1. FRONTEND STRUCTURE (Next.js)

## Purpose

* User interaction
* Form handling
* UI validation
* API communication
* Rendering invoices

Frontend **never**:

* Calculates GST
* Stores secrets
* Applies business rules

---

## Frontend Pages Structure

```text
/app
 ├── /login
 ├── /register
 ├── /profile        (business setup)
 ├── /dashboard
 ├── /invoices
 │    ├── /new
 │    └── /[invoiceId]
 └── /components
```

---

## Page Responsibilities

### `/login`

* Email + password input
* Calls backend login API
* Receives JWT
* Redirects to dashboard

---

### `/register`

* User signup
* Calls register API
* No auto-login logic complexity

---

### `/profile`

* Business setup page
* Mandatory before invoices
* Saves business data once
* Editable later

---

### `/dashboard`

* Entry point after login
* Summary view
* Navigation only

---

### `/invoices`

* List all invoices
* Filter by date
* Click to view invoice

---

### `/invoices/new`

* Create invoice
* Customer search or anonymous
* Add items dynamically
* Submit invoice data

---

### `/invoices/[invoiceId]`

* Read-only invoice view
* Download invoice

---

## Frontend State Handling

* JWT stored in memory or HTTP-only cookie
* Local component state
* No Redux needed

---

# 2. BACKEND STRUCTURE (Spring Boot)

## Purpose

* Authentication
* Authorization
* Business logic
* GST calculation
* Data integrity
* Database interaction

Backend is the **source of truth**.

---

## Backend Package Structure

```text
com.invoiceapp
 ├── auth
 ├── business
 ├── customer
 ├── invoice
 ├── security
 ├── common
 └── InvoiceApplication
```

---

## Package Responsibilities

### `auth`

* Register user
* Login user
* Generate JWT
* Password hashing

---

### `security`

* JWT filter
* Token validation
* Spring Security config
* Request authorization

---

### `business`

* Create business profile
* Fetch business details
* Validate business existence

---

### `customer`

* Search customer
* Create customer
* Associate with business

---

### `invoice`

* Create invoice
* Calculate GST
* Persist invoice + items
* Fetch invoice records

---

### `common`

* Global exception handling
* Response wrappers
* Utility classes

---

## Backend Layered Flow

```text
Controller
→ Service
→ Repository
→ Database
```

Rules:

* Controllers = HTTP only
* Services = logic
* Repositories = DB access

---

# 3. DATABASE STRUCTURE (MySQL)

## Purpose

* Persistent storage
* Data integrity
* Multi-tenant isolation

---

## Core Tables

### USERS

Authentication only.

```text
users
- id (PK)
- name
- email (unique)
- password_hash
- role
- created_at
```

---

### BUSINESSES

Business identity.

```text
businesses
- id (PK)
- user_id (FK)
- business_name
- address
- state_code
- phone
- gst_number (nullable)
- created_at
```

---

### CUSTOMERS

Optional customer records.

```text
customers
- id (PK)
- business_id (FK)
- name (nullable)
- phone (nullable)
- state_code (nullable)
```

---

### INVOICES

Invoice header data.

```text
invoices
- id (PK)
- invoice_number
- business_id (FK)
- customer_id (nullable)
- invoice_type (INTRA / INTER)
- subtotal
- cgst
- sgst
- igst
- total
- created_at
```

---

### INVOICE_ITEMS

Invoice line items.

```text
invoice_items
- id (PK)
- invoice_id (FK)
- item_name
- quantity
- price
- gst_rate
- line_total
```

---

# 4. HOW FRONTEND, BACKEND, AND DB CONNECT

## Example: Create Invoice

```text
Frontend (/invoices/new)
→ POST /api/invoices
→ Backend validates JWT
→ Fetch business
→ Calculate GST
→ Save invoice
→ Save invoice items
→ Return invoice ID
```

Frontend then:

* Redirects to invoice view page

---

## Data Ownership Rule

```text
User → Business → Customers → Invoices → Items
```

No cross-user access possible.

---

# 5. WHY THIS STRUCTURE IS CORRECT

* Clean separation of concerns
* Scales easily
* Easy to debug
* Matches real-world systems
* Interview-approved architecture

---

## FINAL SUMMARY

* **Frontend** handles UI and user actions
* **Backend** enforces rules and calculations
* **Database** stores normalized data

Each layer has one responsibility only.


