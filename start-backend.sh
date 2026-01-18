#!/bin/bash

# Invoice Generator - Quick Start Script
# This script helps you set up and run the Invoice Generator application

echo "======================================"
echo "Invoice Generator - Setup & Run"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: MySQL Setup
echo -e "${YELLOW}Step 1: MySQL Setup${NC}"
echo "------------------------------------"
echo "Please enter your MySQL root password:"
read -s MYSQL_PASSWORD
echo ""

# Test MySQL connection
mysql -u root -p"$MYSQL_PASSWORD" -e "SELECT 1;" &>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to connect to MySQL. Please check your password.${NC}"
    echo ""
    echo "If you don't have MySQL installed or don't know the password:"
    echo "  1. Install MySQL: brew install mysql"
    echo "  2. Start MySQL: brew services start mysql"
    echo "  3. Set password: mysql_secure_installation"
    exit 1
fi

echo -e "${GREEN}✓ MySQL connection successful${NC}"

# Create database
echo "Creating database 'invoice_db'..."
mysql -u root -p"$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS invoice_db;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database created successfully${NC}"
else
    echo -e "${RED}✗ Failed to create database${NC}"
    exit 1
fi

# Verify database
mysql -u root -p"$MYSQL_PASSWORD" -e "SHOW DATABASES LIKE 'invoice_db';" 2>/dev/null | grep invoice_db &>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database 'invoice_db' verified${NC}"
fi

echo ""

# Step 2: Update application.properties
echo -e "${YELLOW}Step 2: Updating Database Configuration${NC}"
echo "------------------------------------"

PROPERTIES_FILE="backend/src/main/resources/application.properties"

if [ -f "$PROPERTIES_FILE" ]; then
    # Update password in properties file
    sed -i.bak "s/spring.datasource.password=.*/spring.datasource.password=$MYSQL_PASSWORD/" "$PROPERTIES_FILE"
    echo -e "${GREEN}✓ Updated application.properties with your MySQL password${NC}"
else
    echo -e "${RED}✗ application.properties not found${NC}"
    exit 1
fi

echo ""

# Step 3: Start Backend
echo -e "${YELLOW}Step 3: Starting Spring Boot Backend${NC}"
echo "------------------------------------"
echo "Running: mvn spring-boot:run"
echo ""
echo "Please wait... This may take a minute on first run."
echo ""
echo -e "${GREEN}The backend will start on http://localhost:8080${NC}"
echo ""
echo "Watch the console output for:"
echo "  - Hibernate table creation statements"
echo "  - 'Started InvoiceApplication' message"
echo ""
echo "Press Ctrl+C to stop the backend when done."
echo ""
echo "======================================"
echo ""

cd backend
mvn spring-boot:run
