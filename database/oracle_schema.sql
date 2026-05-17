-- Vehicle Service Inventory Management System
-- Oracle SQL schema with normalized tables, constraints, sequences, triggers, and sample data.

CREATE TABLE users (
  user_id NUMBER PRIMARY KEY,
  username VARCHAR2(50) NOT NULL UNIQUE,
  password_hash VARCHAR2(255) NOT NULL,
  full_name VARCHAR2(100) NOT NULL,
  role VARCHAR2(20) NOT NULL,
  email VARCHAR2(120) UNIQUE,
  is_active CHAR(1) DEFAULT 'Y' NOT NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT chk_users_role CHECK (role IN ('RECEPTION', 'MECHANIC', 'BILLING', 'ADMIN')),
  CONSTRAINT chk_users_active CHECK (is_active IN ('Y', 'N'))
);

CREATE TABLE customers (
  customer_id NUMBER PRIMARY KEY,
  name VARCHAR2(100) NOT NULL,
  phone VARCHAR2(20) NOT NULL UNIQUE,
  email VARCHAR2(120) UNIQUE,
  address VARCHAR2(250),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE TABLE mechanics (
  mechanic_id NUMBER PRIMARY KEY,
  user_id NUMBER NOT NULL UNIQUE,
  specialization VARCHAR2(80),
  availability_status VARCHAR2(20) DEFAULT 'AVAILABLE' NOT NULL,
  CONSTRAINT fk_mechanics_user FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT chk_mech_availability CHECK (availability_status IN ('AVAILABLE', 'BUSY', 'ON_LEAVE'))
);

CREATE TABLE suppliers (
  supplier_id NUMBER PRIMARY KEY,
  supplier_name VARCHAR2(120) NOT NULL UNIQUE,
  contact_person VARCHAR2(100),
  phone VARCHAR2(20) NOT NULL,
  email VARCHAR2(120),
  address VARCHAR2(250),
  status VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL,
  CONSTRAINT chk_supplier_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE inventory (
  part_id NUMBER PRIMARY KEY,
  supplier_id NUMBER,
  part_name VARCHAR2(120) NOT NULL,
  sku VARCHAR2(50) NOT NULL UNIQUE,
  category VARCHAR2(60),
  unit_price NUMBER(10,2) DEFAULT 0 NOT NULL,
  stock_qty NUMBER DEFAULT 0 NOT NULL,
  reorder_level NUMBER DEFAULT 5 NOT NULL,
  CONSTRAINT fk_inventory_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
  CONSTRAINT chk_inventory_price CHECK (unit_price >= 0),
  CONSTRAINT chk_inventory_stock CHECK (stock_qty >= 0)
);

CREATE TABLE vehicles (
  vehicle_id NUMBER PRIMARY KEY,
  customer_id NUMBER NOT NULL,
  registration_no VARCHAR2(30) NOT NULL UNIQUE,
  make VARCHAR2(60) NOT NULL,
  model VARCHAR2(60) NOT NULL,
  vehicle_year NUMBER(4),
  vin VARCHAR2(40) UNIQUE,
  fuel_type VARCHAR2(20),
  CONSTRAINT fk_vehicles_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  CONSTRAINT chk_vehicle_year CHECK (vehicle_year BETWEEN 1980 AND 2100),
  CONSTRAINT chk_vehicle_fuel CHECK (fuel_type IN ('PETROL', 'DIESEL', 'CNG', 'EV', 'HYBRID') OR fuel_type IS NULL)
);

CREATE TABLE service_bookings (
  booking_id NUMBER PRIMARY KEY,
  customer_id NUMBER NOT NULL,
  vehicle_id NUMBER NOT NULL,
  mechanic_id NUMBER,
  service_type VARCHAR2(80) NOT NULL,
  complaint VARCHAR2(500),
  status VARCHAR2(20) DEFAULT 'PENDING' NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  estimated_cost NUMBER(10,2) DEFAULT 0 NOT NULL,
  actual_cost NUMBER(10,2),
  created_by NUMBER,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  CONSTRAINT fk_sb_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  CONSTRAINT fk_sb_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
  CONSTRAINT fk_sb_mechanic FOREIGN KEY (mechanic_id) REFERENCES mechanics(mechanic_id),
  CONSTRAINT fk_sb_created_by FOREIGN KEY (created_by) REFERENCES users(user_id),
  CONSTRAINT chk_sb_status CHECK (status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  CONSTRAINT chk_sb_cost CHECK (estimated_cost >= 0 AND (actual_cost IS NULL OR actual_cost >= 0))
);

CREATE TABLE service_parts (
  service_part_id NUMBER PRIMARY KEY,
  booking_id NUMBER NOT NULL,
  part_id NUMBER NOT NULL,
  quantity NUMBER NOT NULL,
  price_at_time NUMBER(10,2) NOT NULL,
  CONSTRAINT fk_sp_booking FOREIGN KEY (booking_id) REFERENCES service_bookings(booking_id),
  CONSTRAINT fk_sp_part FOREIGN KEY (part_id) REFERENCES inventory(part_id),
  CONSTRAINT chk_sp_qty CHECK (quantity > 0),
  CONSTRAINT chk_sp_price CHECK (price_at_time >= 0)
);

CREATE TABLE bills (
  bill_id NUMBER PRIMARY KEY,
  booking_id NUMBER NOT NULL UNIQUE,
  customer_id NUMBER NOT NULL,
  labor_amount NUMBER(10,2) DEFAULT 0 NOT NULL,
  parts_amount NUMBER(10,2) DEFAULT 0 NOT NULL,
  tax_amount NUMBER(10,2) DEFAULT 0 NOT NULL,
  discount_amount NUMBER(10,2) DEFAULT 0 NOT NULL,
  total_amount NUMBER(10,2) NOT NULL,
  bill_status VARCHAR2(20) DEFAULT 'UNPAID' NOT NULL,
  generated_by NUMBER,
  generated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_bills_booking FOREIGN KEY (booking_id) REFERENCES service_bookings(booking_id),
  CONSTRAINT fk_bills_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  CONSTRAINT fk_bills_user FOREIGN KEY (generated_by) REFERENCES users(user_id),
  CONSTRAINT chk_bill_status CHECK (bill_status IN ('PAID', 'UNPAID', 'PARTIAL', 'CANCELLED')),
  CONSTRAINT chk_bill_amounts CHECK (labor_amount >= 0 AND parts_amount >= 0 AND tax_amount >= 0 AND discount_amount >= 0 AND total_amount >= 0)
);

CREATE TABLE payments (
  payment_id NUMBER PRIMARY KEY,
  bill_id NUMBER NOT NULL,
  amount NUMBER(10,2) NOT NULL,
  payment_mode VARCHAR2(20) NOT NULL,
  payment_status VARCHAR2(20) DEFAULT 'SUCCESS' NOT NULL,
  transaction_ref VARCHAR2(80) UNIQUE,
  paid_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  received_by NUMBER,
  CONSTRAINT fk_pay_bill FOREIGN KEY (bill_id) REFERENCES bills(bill_id),
  CONSTRAINT fk_pay_user FOREIGN KEY (received_by) REFERENCES users(user_id),
  CONSTRAINT chk_pay_amount CHECK (amount > 0),
  CONSTRAINT chk_pay_mode CHECK (payment_mode IN ('CASH', 'CARD', 'UPI', 'NET_BANKING')),
  CONSTRAINT chk_pay_status CHECK (payment_status IN ('SUCCESS', 'FAILED', 'REFUNDED'))
);

CREATE SEQUENCE seq_users START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_customers START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_mechanics START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_suppliers START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_inventory START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_vehicles START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_service_bookings START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_service_parts START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_bills START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_payments START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER trg_users_bi BEFORE INSERT ON users FOR EACH ROW
BEGIN IF :NEW.user_id IS NULL THEN SELECT seq_users.NEXTVAL INTO :NEW.user_id FROM dual; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_customers_bi BEFORE INSERT ON customers FOR EACH ROW
BEGIN IF :NEW.customer_id IS NULL THEN SELECT seq_customers.NEXTVAL INTO :NEW.customer_id FROM dual; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_mechanics_bi BEFORE INSERT ON mechanics FOR EACH ROW
BEGIN IF :NEW.mechanic_id IS NULL THEN SELECT seq_mechanics.NEXTVAL INTO :NEW.mechanic_id FROM dual; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_suppliers_bi BEFORE INSERT ON suppliers FOR EACH ROW
BEGIN IF :NEW.supplier_id IS NULL THEN SELECT seq_suppliers.NEXTVAL INTO :NEW.supplier_id FROM dual; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_inventory_bi BEFORE INSERT ON inventory FOR EACH ROW
BEGIN IF :NEW.part_id IS NULL THEN SELECT seq_inventory.NEXTVAL INTO :NEW.part_id FROM dual; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_vehicles_bi BEFORE INSERT ON vehicles FOR EACH ROW
BEGIN IF :NEW.vehicle_id IS NULL THEN SELECT seq_vehicles.NEXTVAL INTO :NEW.vehicle_id FROM dual; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_service_bookings_bi BEFORE INSERT ON service_bookings FOR EACH ROW
BEGIN IF :NEW.booking_id IS NULL THEN SELECT seq_service_bookings.NEXTVAL INTO :NEW.booking_id FROM dual; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_service_parts_bi BEFORE INSERT ON service_parts FOR EACH ROW
BEGIN IF :NEW.service_part_id IS NULL THEN SELECT seq_service_parts.NEXTVAL INTO :NEW.service_part_id FROM dual; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_bills_bi BEFORE INSERT ON bills FOR EACH ROW
BEGIN IF :NEW.bill_id IS NULL THEN SELECT seq_bills.NEXTVAL INTO :NEW.bill_id FROM dual; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_payments_bi BEFORE INSERT ON payments FOR EACH ROW
BEGIN IF :NEW.payment_id IS NULL THEN SELECT seq_payments.NEXTVAL INTO :NEW.payment_id FROM dual; END IF; END;
/

CREATE OR REPLACE TRIGGER trg_service_parts_stock
AFTER INSERT ON service_parts
FOR EACH ROW
BEGIN
  UPDATE inventory
  SET stock_qty = stock_qty - :NEW.quantity
  WHERE part_id = :NEW.part_id;
END;
/

INSERT INTO users (username, password_hash, full_name, role, email) VALUES ('admin', 'admin123', 'Owner Admin', 'ADMIN', 'admin@garage.local');
INSERT INTO users (username, password_hash, full_name, role, email) VALUES ('reception', 'reception123', 'Reception Desk', 'RECEPTION', 'reception@garage.local');
INSERT INTO users (username, password_hash, full_name, role, email) VALUES ('mechanic', 'mechanic123', 'Lead Mechanic', 'MECHANIC', 'mechanic@garage.local');
INSERT INTO users (username, password_hash, full_name, role, email) VALUES ('billing', 'billing123', 'Billing Counter', 'BILLING', 'billing@garage.local');

INSERT INTO customers (name, phone, email, address) VALUES ('Alice Smith', '9876543210', 'alice@example.com', 'Mumbai');
INSERT INTO customers (name, phone, email, address) VALUES ('Bob Johnson', '9876543211', 'bob@example.com', 'Pune');
INSERT INTO mechanics (user_id, specialization) VALUES (3, 'Engine and brake systems');
INSERT INTO suppliers (supplier_name, contact_person, phone, email, address) VALUES ('Prime Auto Parts', 'Rahul Mehta', '9000000001', 'sales@primeparts.local', 'Mumbai');
INSERT INTO inventory (supplier_id, part_name, sku, category, unit_price, stock_qty, reorder_level) VALUES (1, 'Oil Filter', 'OF-100', 'Maintenance', 450, 45, 10);
INSERT INTO inventory (supplier_id, part_name, sku, category, unit_price, stock_qty, reorder_level) VALUES (1, 'Brake Pads', 'BP-202', 'Brakes', 2500, 12, 5);
INSERT INTO vehicles (customer_id, registration_no, make, model, vehicle_year, vin, fuel_type) VALUES (1, 'MH12AB1234', 'Toyota', 'Camry', 2022, 'VIN12345ABCDE', 'PETROL');
INSERT INTO service_bookings (customer_id, vehicle_id, mechanic_id, service_type, complaint, status, scheduled_at, estimated_cost, created_by)
VALUES (1, 1, 1, 'Oil change and brake inspection', 'Brake noise and regular maintenance', 'IN_PROGRESS', SYSTIMESTAMP, 4500, 2);
INSERT INTO service_parts (booking_id, part_id, quantity, price_at_time) VALUES (1, 1, 1, 450);
INSERT INTO bills (booking_id, customer_id, labor_amount, parts_amount, tax_amount, discount_amount, total_amount, bill_status, generated_by)
VALUES (1, 1, 1500, 450, 351, 0, 2301, 'UNPAID', 4);

COMMIT;
