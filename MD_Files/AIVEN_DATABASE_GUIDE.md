# Aiven MySQL Database Connection & Troubleshooting Guide

**Database Instance:** `farmeasy-mysql`  
**Host:** `farmeasy-mysql-farmeasy-03.f.aivencloud.com`  
**Port:** `15250`  
**User:** `avnadmin`  
**Default Database:** `defaultdb`  

---

## 1. Why `SELECT 1 + 2 AS three;` Doesn't Show Data

When following Aiven's quickstart instructions:
```bash
mysql --user avnadmin --password=<YOUR_PASSWORD> --host farmeasy-mysql-farmeasy-03.f.aivencloud.com --port 15250 defaultdb
```
Running:
```sql
select 1 + 2 as three;
```
Yields:
```
+-------+
| three |
+-------+
|     3 |
+-------+
1 row in set (0.05 sec)
```

> [!NOTE]
> `SELECT 1 + 2 AS three;` is purely an **arithmetic connectivity test** provided by Aiven. It verifies network connectivity, credentials, and SSL handshake. It **does not retrieve tables, products, or user data**.

---

## 2. Inspecting Tables & Application Data via MySQL CLI

Once connected inside the MySQL CLI prompt (`mysql>`), execute the following commands:

```sql
-- 1. Check all databases on the instance
SHOW DATABASES;

-- 2. Select the database
USE defaultdb;

-- 3. List all tables
SHOW TABLES;

-- 4. View sample records from primary tables
SELECT id, product_name, price, product_quantity FROM product LIMIT 10;
SELECT id, full_name, email, role FROM users LIMIT 10;
SELECT id, name, slug FROM categories;
SELECT * FROM orders LIMIT 5;
```

---

## 3. What To Do If `SHOW TABLES;` Is Empty

A new Aiven MySQL instance starts with an empty `defaultdb`. If no tables appear:

### Step 1: Import Schema
Use [backend/schema.sql](../backend/schema.sql) to create all 30 tables:

```bash
cd /home/kunal/Desktop/FarmEasy

mysql --init-command="SET sql_mode='ANSI_QUOTES';" \
  --user avnadmin \
  --password="<YOUR_PASSWORD>" \
  --host farmeasy-mysql-farmeasy-03.f.aivencloud.com \
  --port 15250 \
  defaultdb < backend/schema.sql
```

> [!TIP]
> The `--init-command="SET sql_mode='ANSI_QUOTES';"` flag allows MySQL to correctly parse double-quoted table names defined in `schema.sql`.

---

## 4. Automated Database Diagnostic Script

A dedicated verification script is available in the repository:

```bash
# 1. Ensure backend/.env exists with DB credentials
cp backend/.env.example backend/.env

# 2. Run the diagnostic script
node backend/test-db.js
```

The script will:
- Test network connectivity and SSL.
- Confirm active database name.
- List all discovered tables.
- Count records in primary tables (`users`, `seller`, `product`, `categories`, `brands`, `orders`, `cart`).
- Alert you if the schema needs to be imported.

---

## 5. Backend Configuration Checklist

In `backend/.env`, configure:

```env
DB_HOST=farmeasy-mysql-farmeasy-03.f.aivencloud.com
DB_PORT=15250
DB_USER=avnadmin
DB_PASSWORD=<YOUR_ACTUAL_PASSWORD>
DB_NAME=defaultdb
```

Starting the backend (`npm run dev` in `backend/`) will automatically ensure baseline `categories`, `brands`, and `tracking` tables exist.
