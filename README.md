# Invoice Generator - GST-Compliant Invoice Management System

A full-stack web application built with Spring Boot and Next.js for generating and managing GST-compliant invoices for small businesses, shopkeepers, and freelancers.

## 📋 Features

- **User Authentication**: JWT-based secure registration and login
- **Business Profile Management**: Set up and manage business information
- **Customer Management**: Store and search customer records
- **Invoice Generation**: Create GST-compliant invoices with automatic tax calculation
- **GST Calculation**: Automatic CGST+SGST (intra-state) or IGST (inter-state) calculation
- **Invoice History**: View and manage all past invoices
- **Anonymous Invoices**: Support for walk-in customers without storing data

## 🛠️ Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Security** with JWT
- **Spring Data JPA** with Hibernate
- **MySQL** Database
- **Maven**

### Frontend
- **Next.js 14**
- **React 18**
- **TypeScript**
- **Tailwind CSS**

## 📁 Project Structure

```
create-invoice/
├── backend/                  # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/invoice/
│   │   │   │   ├── auth/            # Authentication module
│   │   │   │   ├── business/        # Business profile module
│   │   │   │   ├── customer/        # Customer management module
│   │   │   │   ├── invoice/         # Invoice generation module
│   │   │   │   ├── security/        # JWT & Security config
│   │   │   │   ├── common/          # Common utilities
│   │   │   │   └── InvoiceApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── pom.xml
│   └── 
├── frontend/                 # Next.js Frontend
│   ├── app/                  # App Router pages
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   ├── login/
│   │   ├── profile/
│   │   └── register/
│   ├── lib/                  # Utility functions & API clients
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.8+
- Node.js 18+ and npm
- MySQL 8.0+

### Database Setup

1. Install MySQL and start the MySQL server

2. Create a database:
```sql
CREATE DATABASE invoice_db;
```

3. Update database credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/invoice_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your_password
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies and build:
```bash
mvn clean install
```

3. Run the Spring Boot application:
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## 📱 Using the Application

### First-Time Setup

1. **Register**: Visit `http://localhost:3000/register` and create an account
2. **Create Business Profile**: After registration, you'll be redirected to create your business profile
3. **Set up Business Details**: Enter business name, address, state code, phone, and optional GST number
4. **Start Creating Invoices**: Once profile is set up, you can create invoices from the dashboard

### Creating an Invoice

1. Go to Dashboard → "Create New Invoice"
2. Optionally select a customer (or leave anonymous)
3. Add invoice items with:
   - Item name
   - Quantity
   - Price
   - GST rate (%)
4. Review the calculated totals
5. Click "Create Invoice"
6. View or print the generated invoice

### GST Calculation Logic

- **Intra-State** (same state): CGST + SGST (GST split equally)
- **Inter-State** (different states): IGST (full GST amount)
- Anonymous customers default to Intra-State

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Business
- `POST /api/business` - Create business profile
- `GET /api/business` - Get business profile
- `PUT /api/business` - Update business profile

### Customers
- `POST /api/customers` - Create customer
- `GET /api/customers` - Get all customers
- `GET /api/customers/search?query={query}` - Search customers
- `GET /api/customers/{id}` - Get customer by ID

### Invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/{id}` - Get invoice by ID

All endpoints (except auth) require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## 🧪 Testing with Postman

1. Register a user
2. Login and copy the JWT token
3. Create a business profile
4. Create customers (optional)
5. Create invoices with items

## 📊 Database Schema

### Users
- id, name, email, password_hash, role, created_at

### Businesses
- id, user_id (FK), business_name, address, state_code, phone, gst_number, created_at

### Customers
- id, business_id (FK), name, phone, state_code

### Invoices
- id, invoice_number, business_id (FK), customer_id (FK), invoice_type, subtotal, cgst, sgst, igst, total, created_at

### Invoice_Items
- id, invoice_id (FK), item_name, quantity, price, gst_rate, line_total

## 🎯 Future Enhancements (Phase 2)

- Invoice PDF generation and download
- Email invoice to customers
- Payment tracking and reminders
- Invoice templates customization
- Dashboard analytics and reports
- Docker containerization
- AWS/Azure deployment
- Multi-user roles (admin, staff)

## 📝 License

This project is created for educational and portfolio purposes.

## 👨‍💻 Author

Built with Laeba❤️ using Spring Boot and Next.js

---

**Note**: This is Phase-1 focused on core functionality running on localhost. Phase-2 will include cloud deployment, advanced features, and production optimizations.
# invoice-generator
