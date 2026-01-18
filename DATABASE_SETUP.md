# Database Setup Guide

## How MySQL Tables Are Created

This Spring Boot application uses **JPA/Hibernate** with automatic schema generation. The tables are created automatically when you run the application.

## Configuration

In `application.properties`, this setting controls table creation:

```properties
spring.jpa.hibernate.ddl-auto=update
```

### What `ddl-auto=update` Does:
- **Automatically creates tables** if they don't exist
- **Updates existing tables** when entity changes are made
- **Does NOT drop data** - safe for development
- Creates all foreign key relationships automatically

## MySQL Setup Steps

### 1. Check if MySQL is Installed

```bash
mysql --version
```

If not installed:
```bash
brew install mysql
```

### 2. Start MySQL Service

```bash
brew services start mysql
```

Or start temporarily:
```bash
mysql.server start
```

### 3. Secure MySQL Installation (First Time Only)

```bash
mysql_secure_installation
```

Follow the prompts to set a root password.

### 4. Access MySQL

```bash
mysql -u root -p
```

Enter your password when prompted.

### 5. Create Database

Once in MySQL prompt:

```sql
CREATE DATABASE invoice_db;
```

Check if created:
```sql
SHOW DATABASES;
```

Exit MySQL:
```sql
exit;
```

### 6. Update Database Credentials

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/invoice_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

**Replace `YOUR_MYSQL_PASSWORD` with your actual MySQL root password.**

## Tables That Will Be Created

When you run the Spring Boot application, these tables will be automatically created:

### 1. **users**
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL
);
```

### 2. **businesses**
```sql
CREATE TABLE businesses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    gst_number VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3. **customers**
```sql
CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_id BIGINT NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(255),
    state_code VARCHAR(2),
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);
```

### 4. **invoices**
```sql
CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(255) NOT NULL UNIQUE,
    business_id BIGINT NOT NULL,
    customer_id BIGINT,
    invoice_type VARCHAR(10) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    cgst DECIMAL(10,2) DEFAULT 0.00,
    sgst DECIMAL(10,2) DEFAULT 0.00,
    igst DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

### 5. **invoice_items**
```sql
CREATE TABLE invoice_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    gst_rate DECIMAL(5,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);
```

## Verify Tables Were Created

### Method 1: Using MySQL Command Line

```bash
mysql -u root -p invoice_db
```

Then run:
```sql
SHOW TABLES;
```

Expected output:
```
+----------------------+
| Tables_in_invoice_db |
+----------------------+
| businesses           |
| customers            |
| invoice_items        |
| invoices             |
| users                |
+----------------------+
```

Check table structure:
```sql
DESCRIBE users;
DESCRIBE businesses;
DESCRIBE customers;
DESCRIBE invoices;
DESCRIBE invoice_items;
```

### Method 2: Using MySQL Workbench (GUI)

1. Download MySQL Workbench from https://dev.mysql.com/downloads/workbench/
2. Connect to localhost:3306
3. Navigate to `invoice_db` database
4. View tables in the left sidebar

## Sample Data Insertion (For Testing)

After the application creates tables, you can insert test data:

```sql
USE invoice_db;

-- Insert a test user (password is 'password123' hashed with BCrypt)
INSERT INTO users (name, email, password_hash, role, created_at) 
VALUES ('Test User', 'test@example.com', 
'$2a$10$XYZabc123...', 'BUSINESS_OWNER', NOW());

-- Get the user_id
SELECT id FROM users WHERE email = 'test@example.com';

-- Insert a business (replace USER_ID with actual id from above)
INSERT INTO businesses (user_id, business_name, address, state_code, phone, gst_number, created_at)
VALUES (1, 'Test Business', '123 Main St, Mumbai', '27', '9876543210', '27AAAAA0000A1Z5', NOW());
```

## Common Issues & Solutions

### Issue 1: "Access denied for user 'root'@'localhost'"
**Solution:** Update the password in `application.properties`

### Issue 2: "Communications link failure"
**Solution:** Make sure MySQL is running:
```bash
brew services list
brew services start mysql
```

### Issue 3: Database not created
**Solution:** The URL includes `createDatabaseIfNotExist=true`, but manually create it first:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS invoice_db;"
```

### Issue 4: "Table doesn't exist"
**Solution:** Check that `spring.jpa.hibernate.ddl-auto=update` is in `application.properties` and restart the app

## Viewing Application Logs

When you run the Spring Boot app, you'll see SQL statements in the console:

```bash
cd backend
mvn spring-boot:run
```

Look for lines like:
```
Hibernate: create table users (...)
Hibernate: create table businesses (...)
```

This confirms tables are being created.

## Complete Startup Sequence

1. **Start MySQL:**
   ```bash
   brew services start mysql
   ```

2. **Create Database (one time):**
   ```bash
   mysql -u root -p -e "CREATE DATABASE invoice_db;"
   ```

3. **Update credentials in application.properties**

4. **Run Spring Boot:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

5. **Check logs for table creation**

6. **Verify in MySQL:**
   ```bash
   mysql -u root -p invoice_db -e "SHOW TABLES;"
   ```

## Next Steps

Once tables are created:
1. Start the backend (port 8080)
2. Start the frontend (port 3000)
3. Register a new user via the UI
4. Tables will be populated automatically as you use the app

---

**Note:** Tables are created automatically on first run. You don't need to manually create them unless you want to verify the structure or insert test data.
