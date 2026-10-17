# SmartStock Database

## Overview

SmartStock uses PostgreSQL to manage suppliers, customers, products, inventory movements, orders, and order items.

## Database Tables

- `suppliers`: Stores supplier information.
- `customers`: Stores customer information.
- `products`: Stores product details, prices, and stock quantities.
- `inventory_movements`: Records incoming, outgoing, and adjusted stock.
- `orders`: Stores customer orders and their statuses.
- `order_items`: Stores the products and quantities belonging to each order.

## Prerequisites

- PostgreSQL 18 or a compatible version.
- PostgreSQL command-line tool (`psql`).

## Setup Instructions

Run commands from the project root directory.

### 1. Create the database

If the database does not already exist, connect to PostgreSQL:

```powershell
psql -U postgres -d postgres
```

Then run:

```sql
CREATE DATABASE smartstock;
```

Exit PostgreSQL using `\q`. Skip this step if the database already exists.

### 2. Create the tables

```powershell
psql -U postgres -d smartstock -v ON_ERROR_STOP=1 -f ".\database\schema.sql"
```

If `psql` is not recognized, use its full path:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d smartstock -v ON_ERROR_STOP=1 -f ".\database\schema.sql"
```

Only run the schema against a new or intentionally prepared database. Do not rerun it blindly against an existing database.

### 3. Insert sample data

```powershell
psql -U postgres -d smartstock -v ON_ERROR_STOP=1 -f ".\database\seed.sql"
```

Review the seed file before running it against an existing database.

### 4. Verify the tables

Connect to the database and run:

```sql
\dt
```

To count records:

```sql
SELECT
    (SELECT COUNT(*) FROM suppliers) AS suppliers,
    (SELECT COUNT(*) FROM customers) AS customers,
    (SELECT COUNT(*) FROM products) AS products,
    (SELECT COUNT(*) FROM inventory_movements) AS inventory_movements,
    (SELECT COUNT(*) FROM orders) AS orders,
    (SELECT COUNT(*) FROM order_items) AS order_items;
```

Exit using `\q`.

## Important Notes

- Never commit database passwords or other secrets to GitHub.
- Use environment variables for application credentials.
- Order creation and stock updates must use PostgreSQL transactions.
- Stock quantities and inventory movement records must remain consistent.
- Use versioned database migrations for future schema changes.
