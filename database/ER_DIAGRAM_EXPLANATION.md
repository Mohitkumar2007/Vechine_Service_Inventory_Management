# ER Diagram Explanation

## Main Entities

`USERS` stores login accounts and role values: `RECEPTION`, `MECHANIC`, `BILLING`, and `ADMIN`.

`CUSTOMERS` stores vehicle owner details. One customer can own many `VEHICLES`.

`VEHICLES` stores registration and model details. Each vehicle belongs to one customer.

`MECHANICS` extends `USERS` for employees who receive service jobs. One mechanic can be assigned many `SERVICE_BOOKINGS`.

`SERVICE_BOOKINGS` is the central transaction table. It links customer, vehicle, optional mechanic, service complaint, status, schedule, and cost.

`SUPPLIERS` provides spare parts. One supplier can provide many `INVENTORY` items.

`INVENTORY` stores spare parts, stock quantity, price, and reorder level.

`SERVICE_PARTS` is a junction table between `SERVICE_BOOKINGS` and `INVENTORY`. It supports many parts per service and many services per part.

`BILLS` stores one invoice per service booking.

`PAYMENTS` stores payments against bills. One bill can have multiple payments for partial payment support.

## Cardinality

- `CUSTOMERS 1:N VEHICLES`
- `CUSTOMERS 1:N SERVICE_BOOKINGS`
- `VEHICLES 1:N SERVICE_BOOKINGS`
- `USERS 1:1 MECHANICS`
- `MECHANICS 1:N SERVICE_BOOKINGS`
- `SUPPLIERS 1:N INVENTORY`
- `SERVICE_BOOKINGS 1:N SERVICE_PARTS`
- `INVENTORY 1:N SERVICE_PARTS`
- `SERVICE_BOOKINGS 1:1 BILLS`
- `BILLS 1:N PAYMENTS`

## Role-Based Access

- Reception inserts and updates customers, vehicles, and service bookings, and can view bill history.
- Mechanic views assigned bookings, updates booking status, and inserts used spare parts.
- Billing Counter creates bills, records payments, and updates bill payment status.
- Owner/Admin has full access to users, inventory, suppliers, reports, and all operational modules.
