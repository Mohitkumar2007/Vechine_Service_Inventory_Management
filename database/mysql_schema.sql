CREATE DATABASE IF NOT EXISTS vehicle_service_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vehicle_service_db;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('RECEPTION', 'MECHANIC', 'BILLING', 'ADMIN') NOT NULL,
  email VARCHAR(120) UNIQUE,
  is_active CHAR(1) DEFAULT 'Y' NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CHECK (is_active IN ('Y', 'N'))
);

CREATE TABLE IF NOT EXISTS customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(120) UNIQUE,
  address VARCHAR(250),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS mechanics (
  mechanic_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  specialization VARCHAR(80),
  availability_status ENUM('AVAILABLE', 'BUSY', 'ON_LEAVE') DEFAULT 'AVAILABLE' NOT NULL,
  CONSTRAINT fk_mechanics_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_name VARCHAR(120) NOT NULL UNIQUE,
  contact_person VARCHAR(100),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(120),
  address VARCHAR(250),
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE' NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory (
  part_id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT,
  part_name VARCHAR(120) NOT NULL,
  sku VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(60),
  unit_price DECIMAL(10,2) DEFAULT 0 NOT NULL,
  stock_qty INT DEFAULT 0 NOT NULL,
  reorder_level INT DEFAULT 5 NOT NULL,
  CONSTRAINT fk_inventory_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
  CHECK (unit_price >= 0),
  CHECK (stock_qty >= 0)
);

CREATE TABLE IF NOT EXISTS vehicles (
  vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  registration_no VARCHAR(30) NOT NULL UNIQUE,
  make VARCHAR(60) NOT NULL,
  model VARCHAR(60) NOT NULL,
  vehicle_year INT,
  vin VARCHAR(40) UNIQUE,
  fuel_type ENUM('PETROL', 'DIESEL', 'CNG', 'EV', 'HYBRID'),
  CONSTRAINT fk_vehicles_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE IF NOT EXISTS service_bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  mechanic_id INT,
  service_type VARCHAR(80) NOT NULL,
  complaint VARCHAR(500),
  status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING' NOT NULL,
  scheduled_at DATETIME NOT NULL,
  estimated_cost DECIMAL(10,2) DEFAULT 0 NOT NULL,
  actual_cost DECIMAL(10,2),
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  completed_at DATETIME,
  CONSTRAINT fk_sb_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  CONSTRAINT fk_sb_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
  CONSTRAINT fk_sb_mechanic FOREIGN KEY (mechanic_id) REFERENCES mechanics(mechanic_id),
  CONSTRAINT fk_sb_created_by FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS service_parts (
  service_part_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  part_id INT NOT NULL,
  quantity INT NOT NULL,
  price_at_time DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_sp_booking FOREIGN KEY (booking_id) REFERENCES service_bookings(booking_id),
  CONSTRAINT fk_sp_part FOREIGN KEY (part_id) REFERENCES inventory(part_id),
  CHECK (quantity > 0),
  CHECK (price_at_time >= 0)
);

CREATE TABLE IF NOT EXISTS bills (
  bill_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  labor_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,
  parts_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  bill_status ENUM('PAID', 'UNPAID', 'PARTIAL', 'CANCELLED') DEFAULT 'UNPAID' NOT NULL,
  generated_by INT,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_bills_booking FOREIGN KEY (booking_id) REFERENCES service_bookings(booking_id),
  CONSTRAINT fk_bills_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  CONSTRAINT fk_bills_user FOREIGN KEY (generated_by) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  bill_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_mode ENUM('CASH', 'CARD', 'UPI', 'NET_BANKING') NOT NULL,
  payment_status ENUM('SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'SUCCESS' NOT NULL,
  transaction_ref VARCHAR(80) UNIQUE,
  paid_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  received_by INT,
  CONSTRAINT fk_pay_bill FOREIGN KEY (bill_id) REFERENCES bills(bill_id),
  CONSTRAINT fk_pay_user FOREIGN KEY (received_by) REFERENCES users(user_id),
  CHECK (amount > 0)
);

CREATE TRIGGER trg_service_parts_stock_mysql
AFTER INSERT ON service_parts
FOR EACH ROW
  UPDATE inventory
  SET stock_qty = stock_qty - NEW.quantity
  WHERE part_id = NEW.part_id;

INSERT IGNORE INTO users (user_id, username, password_hash, full_name, role, email) VALUES
  (1, 'admin', 'admin123', 'Owner Admin', 'ADMIN', 'admin@garage.local'),
  (2, 'reception', 'reception123', 'Reception Desk', 'RECEPTION', 'reception@garage.local'),
  (3, 'mechanic', 'mechanic123', 'Lead Mechanic', 'MECHANIC', 'mechanic@garage.local'),
  (4, 'billing', 'billing123', 'Billing Counter', 'BILLING', 'billing@garage.local');

INSERT IGNORE INTO customers (customer_id, name, phone, email, address) VALUES
  (1, 'Alice Smith', '9876543210', 'alice@example.com', 'Mumbai');

INSERT IGNORE INTO mechanics (mechanic_id, user_id, specialization) VALUES
  (1, 3, 'Engine and brake systems');

INSERT IGNORE INTO suppliers (supplier_id, supplier_name, contact_person, phone, email, address) VALUES
  (1, 'Prime Auto Parts', 'Rahul Mehta', '9000000001', 'sales@primeparts.local', 'Mumbai');

INSERT IGNORE INTO inventory (part_id, supplier_id, part_name, sku, category, unit_price, stock_qty, reorder_level) VALUES
  (1, 1, 'Oil Filter', 'OF-100', 'Maintenance', 450, 45, 10),
  (2, 1, 'Brake Pads', 'BP-202', 'Brakes', 2500, 12, 5);

INSERT IGNORE INTO vehicles (vehicle_id, customer_id, registration_no, make, model, vehicle_year, vin, fuel_type) VALUES
  (1, 1, 'MH12AB1234', 'Toyota', 'Camry', 2022, 'VIN12345ABCDE', 'PETROL');

INSERT IGNORE INTO service_bookings
  (booking_id, customer_id, vehicle_id, mechanic_id, service_type, complaint, status, scheduled_at, estimated_cost, created_by)
VALUES
  (1, 1, 1, 1, 'Oil change and brake inspection', 'Brake noise and regular maintenance', 'IN_PROGRESS', NOW(), 4500, 2);
