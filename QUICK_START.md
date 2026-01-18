# 🚀 Quick Start Guide

## Prerequisites Checklist
- ✅ Maven installed (already done)
- ✅ MySQL installed and running
- ⚠️ Need to set MySQL password

---

## Option 1: Automated Setup (Recommended)

Run the setup script that will:
- Create the database
- Update configuration
- Start the backend

```bash
./start-backend.sh
```

It will ask for your MySQL password, then handle everything automatically.

---

## Option 2: Manual Setup

### Step 1: Find Your MySQL Password

Your MySQL might have:
- **No password** (default on some installations)
- **Password set during installation**
- **Password from mysql_secure_installation**

To reset MySQL password if forgotten:
```bash
# Stop MySQL
brew services stop mysql

# Start in safe mode
mysqld_safe --skip-grant-tables &

# In another terminal
mysql -u root

# In MySQL prompt:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
exit;

# Kill safe mode MySQL and restart normally
pkill mysqld
brew services start mysql
```

### Step 2: Create Database

```bash
# Replace 'yourpassword' with your actual MySQL password
mysql -u root -p'yourpassword' -e "CREATE DATABASE IF NOT EXISTS invoice_db;"
```

Or log in first:
```bash
mysql -u root -p
# Enter password when prompted

# Then in MySQL:
CREATE DATABASE IF NOT EXISTS invoice_db;
SHOW DATABASES;
exit;
```

### Step 3: Update application.properties

Edit this file:
```
backend/src/main/resources/application.properties
```

Change this line:
```properties
spring.datasource.password=root
```

To your actual MySQL password:
```properties
spring.datasource.password=yourpassword
```

### Step 4: Start Backend

```bash
cd backend
mvn spring-boot:run
```

---

## What Happens When Backend Starts?

### You'll see:

1. **Maven downloads dependencies** (first time only)
   ```
   Downloading from central: https://repo.maven.apache.org/...
   ```

2. **Spring Boot starts**
   ```
   Starting InvoiceApplication...
   ```

3. **Hibernate creates tables** (IMPORTANT - This is where tables are created!)
   ```
   Hibernate: create table users (
       id bigint not null auto_increment,
       name varchar(255) not null,
       email varchar(255) not null,
       ...
   )
   
   Hibernate: create table businesses (...)
   Hibernate: create table customers (...)
   Hibernate: create table invoices (...)
   Hibernate: create table invoice_items (...)
   ```

4. **Application ready**
   ```
   Started InvoiceApplication in 8.234 seconds
   ```

### Tables are created automatically!

The setting `spring.jpa.hibernate.ddl-auto=update` in application.properties tells Hibernate to:
- Create tables if they don't exist
- Update tables if columns are added/modified
- Never drop your data

---

## Verify Tables Were Created

### Option 1: MySQL Command Line
```bash
mysql -u root -p invoice_db
```

Then:
```sql
SHOW TABLES;
```

You should see:
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

To see table structure:
```sql
DESCRIBE users;
DESCRIBE invoices;
```

### Option 2: Check Spring Boot Logs

Look for these lines in the console when the app starts:
```
Hibernate: create table users ...
Hibernate: create table businesses ...
Hibernate: create table customers ...
Hibernate: create table invoices ...
Hibernate: create table invoice_items ...
```

---

## Start Frontend (After Backend is Running)

Open a NEW terminal:

```bash
cd frontend
npm run dev
```

Frontend will start on http://localhost:3000

---

## Common Issues & Solutions

### Issue: "mvn: command not found"
**Solution:** Already fixed! Maven is now installed.

### Issue: "Access denied for user 'root'@'localhost'"
**Solution:** 
1. Find your MySQL password
2. Update `application.properties` with correct password

### Issue: "Communications link failure"
**Solution:**
```bash
# Check if MySQL is running
brew services list

# Start MySQL if stopped
brew services start mysql
```

### Issue: "Port 8080 already in use"
**Solution:**
```bash
# Find what's using port 8080
lsof -i :8080

# Kill it
kill -9 <PID>
```

### Issue: Tables not created
**Solution:**
1. Check `spring.jpa.hibernate.ddl-auto=update` is in application.properties
2. Check MySQL connection successful (look for errors in logs)
3. Restart the application

---

## Testing the Setup

1. **Backend running?** Visit http://localhost:8080/api/auth/login (should see error, but means backend is up)

2. **Database working?** Check logs for "Hibernate: create table" messages

3. **Frontend running?** Visit http://localhost:3000

4. **Full test:** 
   - Register a new user at http://localhost:3000/register
   - Check MySQL: `SELECT * FROM users;` (should see your user)

---

## Summary of Commands

```bash
# 1. Create database (one time)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS invoice_db;"

# 2. Start backend (from project root)
cd backend
mvn spring-boot:run

# 3. Start frontend (new terminal, from project root)
cd frontend
npm run dev

# 4. Check tables (optional)
mysql -u root -p invoice_db -e "SHOW TABLES;"
```

---

## 📝 Important Notes

- **Tables are created AUTOMATICALLY** when backend starts
- First run takes longer (Maven downloads dependencies)
- Watch console for "Hibernate: create table" messages
- Database password must match in application.properties
- Keep both backend and frontend running in separate terminals

---

## Need Help?

1. Check logs in the backend terminal
2. Review [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed info
3. MySQL issues? Run `mysql -u root -p` to test connection
