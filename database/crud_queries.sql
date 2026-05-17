-- Common CRUD and report queries for the DBMS viva/documentation.

-- Reception: add/view/update customer.
INSERT INTO customers (name, phone, email, address) VALUES (:name, :phone, :email, :address);
SELECT * FROM customers WHERE LOWER(name) LIKE LOWER('%' || :search || '%') OR phone = :search;
UPDATE customers SET name = :name, phone = :phone, email = :email, address = :address WHERE customer_id = :customer_id;

-- Reception: register vehicle and schedule service.
INSERT INTO vehicles (customer_id, registration_no, make, model, vehicle_year, vin, fuel_type)
VALUES (:customer_id, :registration_no, :make, :model, :vehicle_year, :vin, :fuel_type);
INSERT INTO service_bookings (customer_id, vehicle_id, mechanic_id, service_type, complaint, scheduled_at, estimated_cost, created_by)
VALUES (:customer_id, :vehicle_id, :mechanic_id, :service_type, :complaint, :scheduled_at, :estimated_cost, :created_by);

-- Mechanic: assigned jobs, update status, add spare parts.
SELECT sb.*, v.registration_no, v.make, v.model, c.name customer_name
FROM service_bookings sb
JOIN vehicles v ON v.vehicle_id = sb.vehicle_id
JOIN customers c ON c.customer_id = sb.customer_id
WHERE sb.mechanic_id = :mechanic_id;
UPDATE service_bookings SET status = :status, completed_at = CASE WHEN :status = 'COMPLETED' THEN SYSTIMESTAMP ELSE completed_at END
WHERE booking_id = :booking_id;
INSERT INTO service_parts (booking_id, part_id, quantity, price_at_time)
SELECT :booking_id, part_id, :quantity, unit_price FROM inventory WHERE part_id = :part_id;

-- Billing: generate bill, payment, history.
INSERT INTO bills (booking_id, customer_id, labor_amount, parts_amount, tax_amount, discount_amount, total_amount, generated_by)
VALUES (:booking_id, :customer_id, :labor, :parts, :tax, :discount, :total, :user_id);
INSERT INTO payments (bill_id, amount, payment_mode, transaction_ref, received_by)
VALUES (:bill_id, :amount, :payment_mode, :transaction_ref, :user_id);
UPDATE bills SET bill_status = 'PAID' WHERE bill_id = :bill_id;
SELECT b.*, c.name customer_name FROM bills b JOIN customers c ON c.customer_id = b.customer_id ORDER BY b.generated_at DESC;

-- Admin reports.
SELECT COUNT(*) total_customers FROM customers;
SELECT COUNT(*) total_services FROM service_bookings;
SELECT NVL(SUM(total_amount), 0) total_revenue FROM bills WHERE bill_status = 'PAID';
SELECT part_name, sku, stock_qty, reorder_level FROM inventory WHERE stock_qty <= reorder_level;
