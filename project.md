
# PHASE-1: COMPLETE PROJECT CREATION (LOCAL)
This project is a **GST-compliant invoice generation and management system** designed for small business owners, shopkeepers, freelancers, and early-stage startups who need a simple, reliable way to create and store invoices without using complex accounting software.

The core idea is to give a business owner a single platform where they can **register, set up their business profile once, and then generate unlimited invoices**. After logging in, the user defines their business details such as business name, address, state, phone number, and GST number. These details are then automatically embedded into every invoice, removing repetitive manual work and reducing errors.

When creating an invoice, the user can either **select an existing customer, add a new customer, or generate an invoice without storing customer details**. This supports real-world scenarios like walk-in customers. The user adds invoice items dynamically, specifying item name, quantity, price, and GST rate. The system calculates the subtotal, applies the correct GST logic, and determines whether CGST + SGST or IGST should be applied based on the business and customer states. All tax calculations are handled on the backend to ensure accuracy and consistency.

The application securely manages user authentication using **JWT-based login**, ensuring that each business owner can only access their own data. All invoices, customers, and business information are stored in a relational database, allowing users to view past invoices, track records, and maintain proper financial documentation.

This project focuses on **clarity, correctness, and real-world usability**, not feature overload. In its first phase, it deliberately avoids advanced features like payments, messaging, or third-party integrations, concentrating instead on building a strong foundation: clean architecture, correct data modeling, secure authentication, and accurate GST calculation. Once complete, the system can later be extended with cloud deployment, invoice sharing, analytics, or automation, making it both a practical tool and a strong full-stack portfolio project.


## 1. Phase-1 Goal (Non-Negotiable)

Build a **fully working invoice generator system on localhost** where:

* A user can register and log in
* A business profile is created
* GST-compliant invoices are generated
* Data persists in MySQL
* App works end-to-end locally

If this works perfectly, phase-2 is trivial.

---

## 2. What Phase-1 Is and Is NOT

### Phase-1 IS:

* Product logic
* Database design
* Authentication
* GST calculation
* UI + Backend integration

### Phase-1 IS NOT:

* Docker
* AWS
* CI/CD
* OAuth
* Microservices

---

## 3. Phase-1 Tech Stack (Final)

### Frontend

* Next.js
* React
* Tailwind CSS
* Fetch API

### Backend

* Spring Boot
* Spring Security
* JWT Authentication
* Spring Data JPA
* Hibernate

### Database

* MySQL (local)

### Tools

* VS Code
* Postman
* MySQL Workbench
* Git

---

## 4. Phase-1 System Architecture

```text
Browser
↓
Next.js (localhost:3000)
↓
Spring Boot API (localhost:8080)
↓
MySQL (localhost:3306)
```

No proxies. No containers. Simple.

---

## 5. Phase-1 User Roles

Only **ONE ROLE**:

```text
BUSINESS_OWNER
```

Do not add admin, staff, etc.

---

## 6. Phase-1 Authentication Design (JWT)

### Why JWT

* Stateless
* Simple
* Industry standard
* No session storage

### Flow

1. User registers
2. Password hashed using BCrypt
3. User logs in
4. Backend generates JWT
5. JWT returned to frontend
6. JWT sent in `Authorization` header
7. Backend validates token on every request

JWT contains:

* userId
* role
* expiry

Token expiry: 15–30 minutes

---

## 7. Phase-1 Database Design (Authoritative)

### USERS

Purpose: Authentication only

```text
id
name
email (unique)
password_hash
role
created_at
```

---

### BUSINESSES

Purpose: Business identity

```text
id
user_id (FK)
business_name
address
state_code
phone
gst_number (nullable)
created_at
```

**Invoice creation blocked until this exists.**

---

### CUSTOMERS

Purpose: Optional customer storage

```text
id
business_id (FK)
name (nullable)
phone (nullable)
state_code (nullable)
```

Anonymous invoices supported.

---

### INVOICES

Purpose: Invoice header

```text
id
invoice_number
business_id (FK)
customer_id (nullable)
invoice_type (INTRA / INTER)
subtotal
cgst
sgst
igst
total
created_at
```

---

### INVOICE_ITEMS

Purpose: Invoice line items

```text
id
invoice_id (FK)
item_name
quantity
price
gst_rate
line_total
```

---

## 8. Phase-1 Business Rules (Critical)

### Business Rules

* One user → one business
* No invoice without business
* Invoice must have at least one item
* GST calculated only on backend
* Money handled using BigDecimal

---

## 9. Phase-1 GST Logic

### Decision

```text
If business_state == customer_state → CGST + SGST
Else → IGST
```

### Defaults

* No customer → INTRA
* No GST number → GST = 0

Frontend never calculates tax.

---

## 10. Phase-1 Backend Architecture

```text
Controller → Service → Repository → Database
```

Rules:

* Controllers handle HTTP only
* Services contain business logic
* Repositories talk to DB
* No logic leakage

---

## 11. Phase-1 API Responsibility Breakdown

### Auth APIs

* Register
* Login

### Business APIs

* Create business
* Get business

### Customer APIs

* Search customer
* Create customer

### Invoice APIs

* Create invoice
* Get invoice
* List invoices

---

## 12. Phase-1 Frontend Pages

```text
/login
/register
/profile (business setup)
/dashboard
/invoices
/invoices/new
/invoices/[id]
```

Routing is simple. No role-based routing.

---

## 13. Phase-1 User Flow (End-to-End)

### First-Time User

```text
Register
→ Login
→ Redirect to Business Setup
→ Save business
→ Dashboard unlocked
```

---

### Invoice Creation

```text
Dashboard
→ Create Invoice
→ Select/Add Customer (optional)
→ Add Items
→ Submit
→ Backend calculates GST
→ Invoice saved
→ Invoice view
```

---

## 14. Phase-1 Error Handling

Backend:

* 400 → Validation error
* 401 → Unauthorized
* 403 → Forbidden
* 404 → Not found
* 500 → Server error

Frontend:

* Show readable messages
* Do not expose stack traces

---

## 15. Phase-1 Testing Strategy

* Use Postman to test APIs first
* Test auth separately
* Test invoice creation with:

  * GST
  * No GST
  * Anonymous customer
* Then connect frontend

No automated tests yet.

---

## 16. Phase-1 Folder Structure

### Backend

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

### Frontend

```text
app/
├── login
├── register
├── dashboard
├── profile
├── invoices
└── components
```

---

## 17. Phase-1 Completion Checklist

Phase-1 is **DONE** only when:

* User can register and login
* JWT protects APIs
* Business profile exists
* Invoice is created and stored
* GST is correct
* Data persists in MySQL
* App works fully on localhost

---

## 18. Why This Phase-1 Is Perfect

* Real-world logic
* No infra noise
* Debuggable
* Resume-worthy
* Strong Spring Boot fundamentals

---

## 19. What Comes AFTER Phase-1

Only after everything above works:

* Docker
* AWS
* HTTPS
* Scaling

Not before.

---
