
-- SmartStock sample data
-- Safe to rerun: uses unique identifiers to avoid duplicate records.

BEGIN;

INSERT INTO suppliers (name, email, phone, address)
VALUES
    ('Tech Supplies Ltd', 'sales@techsupplies.example', '091-1111111', 'Peshawar'),
    ('Office Essentials', 'orders@officeessentials.example', '091-2222222', 'Islamabad')
ON CONFLICT (email) DO NOTHING;

INSERT INTO customers (name, email, phone, address)
VALUES
    ('Ahmad Khan', 'ahmad@example.com', '0300-1111111', 'Peshawar'),
    ('Sara Ali', 'sara@example.com', '0300-2222222', 'Islamabad')
ON CONFLICT (email) DO NOTHING;

INSERT INTO products
    (supplier_id, sku, name, description, unit_price, stock_quantity, reorder_level)
SELECT s.supplier_id, v.sku, v.name, v.description, v.unit_price, v.stock_quantity, v.reorder_level
FROM suppliers s
JOIN (
    VALUES
        ('TECH-001', 'Wireless Mouse', 'Wireless computer mouse', 1500.00::NUMERIC, 30, 5),
        ('TECH-002', 'USB Keyboard', 'USB keyboard', 2500.00::NUMERIC, 20, 5),
        ('TECH-003', 'USB-C Cable', 'USB-C charging cable', 800.00::NUMERIC, 50, 10)
) AS v(sku, name, description, unit_price, stock_quantity, reorder_level)
ON s.name = 'Tech Supplies Ltd'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory_movements (product_id, movement_type, quantity, notes)
SELECT p.product_id, 'IN', p.stock_quantity, 'Initial sample stock'
FROM products p
WHERE p.sku IN ('TECH-001', 'TECH-002', 'TECH-003')
AND NOT EXISTS (
    SELECT 1
    FROM inventory_movements m
    WHERE m.product_id = p.product_id
      AND m.notes = 'Initial sample stock'
);

INSERT INTO orders (customer_id, status, notes)
SELECT c.customer_id, 'PENDING', 'Sample order'
FROM customers c
WHERE c.email = 'ahmad@example.com'
AND NOT EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.customer_id
      AND o.notes = 'Sample order'
);

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.order_id, p.product_id, 2, p.unit_price
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
JOIN products p ON p.sku = 'TECH-001'
WHERE c.email = 'ahmad@example.com'
  AND o.notes = 'Sample order'
ON CONFLICT (order_id, product_id) DO NOTHING;

COMMIT;
