Below is a **clean, structured PHASE-2 DESIGN**, focused **only** on what you asked:

* Create Invoice (enhanced)
* Customers
* View Invoice
* Templates
  No analytics yet. No cloud talk. No code.

I will also correct one **important conceptual mistake** you made, gently but clearly.

---

# PHASE-2 GOAL (VERY CLEAR)

Phase-2 upgrades your app from
**“invoice generator” → “invoice management system”**

The focus is:

* Flexibility
* Customization
* Real business use cases
* Future extensibility

---

## FIRST: IMPORTANT CORRECTION (VERY IMPORTANT)

You said:

> “Each customer can have one invoice”

This is **WRONG** for real systems.

### Correct rule:

* One **Business** → many Customers
* One **Customer** → many Invoices
* One **Invoice** → belongs to one Customer

So relationship is:

```
Business 1 ── N Customers
Customer 1 ── N Invoices
```

Do **not** limit customer to one invoice.

Now we proceed correctly.

---

# PHASE-2 SCOPE (LOCKED)

### INCLUDED

* Enhanced Customer model
* Enhanced Invoice model
* Invoice Items with discount & description
* Payment info
* Invoice status (paid / partial / due)
* Templates (config-based)
* Sidebar navigation

### EXCLUDED (for now)

* Analytics graphs
* Notifications
* Cloud
* Inventory

---

# 1. ENHANCED CUSTOMER MODULE

## Purpose

Make customers reusable, searchable, and business-scoped.

---

## CUSTOMER TABLE (PHASE-2)

```text
customers
- id (PK)
- business_id (FK)
- name (nullable)
- phone (nullable)
- email (nullable)
- location (nullable)
- created_at
```

### Rules

* All fields nullable except business_id
* Customer belongs to exactly one business
* Same phone can exist in different businesses

---

## CUSTOMER FLOW (UI)

### Create Invoice → Customer Section

* Search by name or phone
* If found → auto-fill
* If not found → quick add modal
* Or → continue without customer

Customer data saved **only if user confirms**.

---

# 2. ENHANCED INVOICE MODEL (CORE OF PHASE-2)

This is the heart of your upgrade.

---

## INVOICE TABLE (PHASE-2)

```text
invoices
- id (PK)
- invoice_number
- business_id (FK)
- customer_id (nullable)

- invoice_title (nullable)
- invoice_date
- due_date (nullable)

- subtotal
- total_discount
- tax_total
- total_amount
- paid_amount
- due_amount

- status (DRAFT | PARTIAL | PAID)

- template_id (nullable)
- notes (nullable)

- created_at
```

### Why this works

* Supports partial payments
* Supports due tracking
* Supports templates
* Supports customization
* Future-proof

---

## INVOICE STATUS LOGIC

| Condition           | Status  |
| ------------------- | ------- |
| paid_amount = 0     | DUE     |
| paid_amount < total | PARTIAL |
| paid_amount = total | PAID    |

Backend controlled. UI only displays.

---

# 3. ENHANCED INVOICE ITEMS

## INVOICE_ITEMS TABLE (PHASE-2)

```text
invoice_items
- id (PK)
- invoice_id (FK)
- item_name
- item_description (nullable)
- quantity
- price
- discount (nullable)
- gst_rate
- line_total
```

### Line Total Formula

```text
(qty × price) − discount + tax
```

All computed backend-side.

---

# 4. PAYMENT INFORMATION (FLEXIBLE & NULLABLE)

Instead of hardcoding logic, we separate it cleanly.

---

## PAYMENTS TABLE

```text
payments
- id (PK)
- invoice_id (FK)
- payment_method (CASH | BANK | UPI)
- reference_id (nullable)
- bank_name (nullable)
- account_details (nullable)
- amount
- payment_date
```

### Why separate table?

* Multiple payments per invoice
* Partial payments
* Clean audit trail

Invoice sums payments to compute paid & due.

---

# 5. TEMPLATE SYSTEM (VERY IMPORTANT DESIGN)

This is where many beginners fail. We do it right.

---

## TEMPLATE IDEA (CORRECT APPROACH)

Templates are **NOT HTML stored in DB**.
Templates are **CONFIGURATION**.

---

## TEMPLATE TABLE

```text
invoice_templates
- id (PK)
- business_id (FK)
- name
- config_json
- is_default
```

---

## TEMPLATE CONFIG (EXAMPLE)

```json
{
  "show_customer_email": false,
  "show_customer_phone": true,
  "show_discount": false,
  "show_payment_info": true,
  "show_logo": true,
  "show_signature": false
}
```

### Benefits

* Add new sections without DB changes
* Hide/show sections per business
* Easy UI toggles
* Future-proof

---

## USER FLOW (TEMPLATES)

1. Business opens Templates page
2. Selects default template
3. Toggles sections ON/OFF
4. Invoice renders based on config

No schema changes needed later.

---

# 6. CUSTOM SECTIONS (QR, LOGO, SIGNATURE)

Handled via **template config + assets**

---

## BUSINESS ASSETS TABLE (OPTIONAL)

```text
business_assets
- id
- business_id
- type (LOGO | SIGNATURE | QR)
- file_url
```

Template decides whether to show them.

---

# 7. SIDEBAR NAVIGATION (PHASE-2 UI)

```text
Sidebar
- Dashboard
- Invoices
- Customers
- Templates
- Settings
- Logout
```

Purpose:

* Scales UI
* Cleaner navigation
* Professional feel

---

# 8. VIEW INVOICE (PHASE-2)

### View Invoice Page shows:

* Template-applied layout
* Payment status badge
* Due amount if any
* Payment history (optional expandable)
* Download button

Read-only.

---

# 9. NULLABILITY STRATEGY (YOU ASKED THIS)

You are right to want nullable fields.

### Rule:

* Business_id → NOT NULL
* Invoice_id → NOT NULL
* Everything else → NULLABLE

Enforcement is **business logic**, not DB constraints.

---

# 10. HOW THIS SUPPORTS FUTURE FEATURES

| Feature            | Supported |
| ------------------ | --------- |
| QR code            | Yes       |
| Barcode            | Yes       |
| Signature          | Yes       |
| Branding           | Yes       |
| Analytics          | Yes       |
| Multiple templates | Yes       |
| Partial payments   | Yes       |

No schema rewrite needed later.

---

# FINAL VERDICT

Your Phase-2 vision is **strong and realistic**.
The key win is:

* Config-based templates
* Separate payments
* Flexible invoice model

This is **exactly how professional billing systems are built**.

---


Below is the **final, clean, professional definition of CUSTOMER DETAILS** for your **Phase-2 invoice system**.
This covers **what to store, why to store it, how it is used, and what stays nullable**.

No code. No fluff.

---

# CUSTOMER DETAILS — PHASE-2 DESIGN

## Purpose of Customer Details

Customer details exist to:

* Reuse customer data across invoices
* Reduce repeated typing
* Enable invoice history per customer
* Support due tracking and analytics later

Customer details are **optional**, not mandatory.

---

## CUSTOMER ENTITY (WHAT IT REPRESENTS)

A **Customer** is:

* A person or organization
* Belonging to **one business**
* Associated with **multiple invoices**
* Stored only if the business owner wants

---

## CUSTOMER TABLE (FINAL)

```text
customers
- id (PK)
- business_id (FK)
- name (nullable)
- phone (nullable)
- email (nullable)
- location (nullable)
- created_at
```

---

## FIELD-BY-FIELD EXPLANATION

### 1. `business_id` (NOT NULL)

* Identifies which business owns the customer
* Prevents cross-business data access
* One business → many customers

This is mandatory.

---

### 2. `name` (nullable)

* Customer full name or company name
* Optional because:

  * Walk-in customers exist
  * Some invoices don’t need names

Shown on invoice if present.

---

### 3. `phone` (nullable)

* Used for:

  * Searching customers
  * Identifying repeat customers
* Not enforced unique
* Optional

Never required to create an invoice.

---

### 4. `email` (nullable)

* Used later for:

  * Email invoices
* Optional
* Can be hidden by template

---

### 5. `location` (nullable)

* City / State / Area
* Used for:

  * GST intra/inter decision
  * Invoice address section
* Optional

If missing, fallback to business state.

---

### 6. `created_at`

* Audit purpose
* Sorting
* Analytics later

---

## CUSTOMER ↔ INVOICE RELATIONSHIP

Correct and final:

```
One Customer → Many Invoices
One Invoice → Zero or One Customer
```

Anonymous invoices are supported.

---

## CUSTOMER CREATION FLOW (REALISTIC)

### During Invoice Creation

1. User types name or phone
2. System searches existing customers
3. If found → select
4. If not found:

   * Quick add modal
   * OR continue without saving

Customer is saved **only if confirmed**.

---

## CUSTOMER PAGE (PHASE-2 UI)

### Customers List

* Table view
* Columns:

  * Name
  * Phone
  * Location
  * Total invoices (derived)
* Actions:

  * View customer
  * Edit
  * Delete (soft delete recommended)

---

### Customer Detail View

* Basic info
* List of invoices linked to this customer
* Total billed amount (derived)

Read-only analytics for now.

---

## NULLABILITY STRATEGY (IMPORTANT)

| Field       | Nullable | Reason    |
| ----------- | -------- | --------- |
| business_id | ❌        | Ownership |
| name        | ✅        | Walk-ins  |
| phone       | ✅        | Optional  |
| email       | ✅        | Optional  |
| location    | ✅        | Optional  |

Validation happens in **service layer**, not DB.

---

## WHAT YOU SHOULD NOT ADD NOW

❌ Customer login
❌ Customer authentication
❌ Customer portal
❌ Address splitting into multiple tables

These belong to future enterprise systems.

---

## WHY THIS CUSTOMER DESIGN IS CORRECT

* Matches real billing systems
* Flexible
* Low friction for users
* Supports growth
* No schema rewrite later

---

## FINAL SUMMARY

Customer details in your system are:

* **Business-scoped**
* **Optional**
* **Reusable**
* **Invoice-linked**
* **Template-controlled**

This is the correct professional approach.

