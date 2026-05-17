from datetime import datetime
from django.contrib.auth.hashers import check_password, make_password
from django.db import connection, transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .db import fetch_all, execute, run_cursor
from .permissions import has_permission, ROLE_PERMISSIONS


def current_role(request):
    return request.headers.get('X-Role', '').upper()


@api_view(['POST'])
def login(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')
    rows = fetch_all(
        """
        SELECT user_id, username, full_name, role, password_hash, is_active
        FROM users
        WHERE LOWER(username) = LOWER(:username)
        """,
        {'username': username},
    )
    password_matches = bool(rows) and (
        check_password(password, rows[0]['password_hash']) or password == rows[0]['password_hash']
    )
    if not rows or rows[0]['is_active'] != 'Y' or not password_matches:
        return Response({'detail': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)

    user = rows[0]
    return Response({
        'user': {
            'id': user['user_id'],
            'username': user['username'],
            'name': user['full_name'],
            'role': user['role'],
            'permissions': sorted(ROLE_PERMISSIONS.get(user['role'], [])),
        }
    })


@api_view(['GET', 'POST'])
def customers(request):
    role = current_role(request)
    if request.method == 'GET':
        if not has_permission(role, 'customers'):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        return Response(fetch_all('SELECT * FROM customers ORDER BY customer_id DESC'))

    if not has_permission(role, 'customers'):
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    execute(
        """
        INSERT INTO customers (name, phone, email, address)
        VALUES (:name, :phone, :email, :address)
        """,
        request.data,
    )
    return Response({'detail': 'Customer created in MySQL'}, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
def users(request):
    role = current_role(request)
    if not has_permission(role, '*'):
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    if request.method == 'GET':
        return Response(fetch_all(
            """
            SELECT user_id, username, full_name, role, email, is_active, created_at
            FROM users
            ORDER BY user_id
            """
        ))

    required = ['username', 'password', 'full_name', 'role']
    missing = [field for field in required if not str(request.data.get(field, '')).strip()]
    if missing:
        return Response({'detail': f'Missing fields: {", ".join(missing)}'}, status=status.HTTP_400_BAD_REQUEST)
    execute(
        """
        INSERT INTO users (username, password_hash, full_name, role, email, is_active)
        VALUES (:username, :password_hash, :full_name, :role, :email, 'Y')
        """,
        {
            'username': request.data['username'],
            'password_hash': request.data['password'],
            'full_name': request.data['full_name'],
            'role': request.data['role'],
            'email': request.data.get('email') or None,
        },
    )
    return Response({'detail': 'User created in MySQL'}, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
def vehicles(request):
    role = current_role(request)
    if request.method == 'GET':
        if not has_permission(role, 'vehicles'):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        return Response(fetch_all(
            """
            SELECT v.*, c.name AS customer_name
            FROM vehicles v
            JOIN customers c ON c.customer_id = v.customer_id
            ORDER BY v.vehicle_id DESC
            """
        ))

    if not has_permission(role, 'vehicles'):
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    required = ['customer_phone', 'registration_no', 'make', 'model']
    missing = [field for field in required if not str(request.data.get(field, '')).strip()]
    if missing:
        return Response({'detail': f'Missing fields: {", ".join(missing)}'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        with connection.cursor() as cursor:
            run_cursor(cursor, "SELECT customer_id FROM customers WHERE phone = :phone", {'phone': request.data['customer_phone']})
            row = cursor.fetchone()
            if row:
                customer_id = row[0]
            else:
                run_cursor(
                    cursor,
                    "INSERT INTO customers (name, phone, email, address) VALUES (:name, :phone, NULL, :address)",
                    {
                        'name': request.data.get('customer_name') or 'Walk-in Customer',
                        'phone': request.data['customer_phone'],
                        'address': 'Vehicle counter entry',
                    },
                )
                customer_id = cursor.lastrowid

            run_cursor(
                cursor,
                """
                INSERT INTO vehicles (customer_id, registration_no, make, model, vehicle_year, vin, fuel_type)
                VALUES (:customer_id, :registration_no, :make, :model, :vehicle_year, :vin, :fuel_type)
                ON DUPLICATE KEY UPDATE customer_id = VALUES(customer_id), make = VALUES(make), model = VALUES(model)
                """,
                {
                    'customer_id': customer_id,
                    'registration_no': request.data['registration_no'].upper(),
                    'make': request.data['make'],
                    'model': request.data['model'],
                    'vehicle_year': request.data.get('vehicle_year') or datetime.now().year,
                    'vin': request.data.get('vin') or None,
                    'fuel_type': request.data.get('fuel_type') or None,
                },
            )

    return Response({'detail': 'Vehicle saved in MySQL'}, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
def inventory(request):
    role = current_role(request)
    if request.method == 'GET':
        if not has_permission(role, 'inventory:view') and not has_permission(role, '*'):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        return Response(fetch_all(
            """
            SELECT i.*, s.supplier_name
            FROM inventory i
            LEFT JOIN suppliers s ON s.supplier_id = i.supplier_id
            ORDER BY i.part_id DESC
            """
        ))

    if not has_permission(role, '*'):
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    execute(
        """
        INSERT INTO inventory (supplier_id, part_name, sku, category, unit_price, stock_qty, reorder_level)
        VALUES (:supplier_id, :part_name, :sku, :category, :unit_price, :stock_qty, :reorder_level)
        """,
        {
            'supplier_id': request.data.get('supplier_id') or None,
            'part_name': request.data.get('part_name'),
            'sku': request.data.get('sku'),
            'category': request.data.get('category') or 'General',
            'unit_price': request.data.get('unit_price') or 0,
            'stock_qty': request.data.get('stock_qty') or 0,
            'reorder_level': request.data.get('reorder_level') or 5,
        },
    )
    return Response({'detail': 'Inventory item created in MySQL'}, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
def inventory_restock(request, part_id):
    role = current_role(request)
    if not has_permission(role, '*'):
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    qty = int(request.data.get('quantity') or 10)
    execute(
        "UPDATE inventory SET stock_qty = stock_qty + :quantity WHERE part_id = :part_id",
        {'quantity': qty, 'part_id': part_id},
    )
    return Response({'detail': 'Inventory restocked'})


@api_view(['GET', 'POST'])
def suppliers(request):
    role = current_role(request)
    if not has_permission(role, '*'):
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    if request.method == 'GET':
        return Response(fetch_all("SELECT * FROM suppliers ORDER BY supplier_id DESC"))

    execute(
        """
        INSERT INTO suppliers (supplier_name, contact_person, phone, email, address, status)
        VALUES (:supplier_name, :contact_person, :phone, :email, :address, 'ACTIVE')
        """,
        {
            'supplier_name': request.data.get('supplier_name'),
            'contact_person': request.data.get('contact_person') or 'New Contact',
            'phone': request.data.get('phone') or '0000000000',
            'email': request.data.get('email') or None,
            'address': request.data.get('address') or '',
        },
    )
    return Response({'detail': 'Supplier created in MySQL'}, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
def service_bookings(request):
    role = current_role(request)
    if request.method == 'GET':
        permission = 'jobs:view' if role == 'MECHANIC' else 'service_bookings'
        if not has_permission(role, permission):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        return Response(fetch_all(
            """
            SELECT
              sb.booking_id,
              c.name AS customer_name,
              c.phone,
              v.make,
              v.model,
              v.registration_no,
              sb.service_type,
              sb.complaint,
              sb.status,
              sb.scheduled_at,
              sb.estimated_cost
            FROM service_bookings sb
            JOIN customers c ON c.customer_id = sb.customer_id
            JOIN vehicles v ON v.vehicle_id = sb.vehicle_id
            ORDER BY sb.scheduled_at DESC
            """
        ))

    if not has_permission(role, 'service_bookings'):
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    required = ['customer', 'phone', 'vehicle', 'registration_no', 'service_type', 'scheduled_at']
    missing = [field for field in required if not str(request.data.get(field, '')).strip()]
    if missing:
        return Response({'detail': f'Missing fields: {", ".join(missing)}'}, status=status.HTTP_400_BAD_REQUEST)

    vehicle_name = request.data['vehicle'].strip()
    parts = vehicle_name.split(maxsplit=1)
    make = parts[0].upper()
    model = parts[1].upper() if len(parts) > 1 else 'GENERAL'
    scheduled_at = datetime.fromisoformat(request.data['scheduled_at'])

    with transaction.atomic():
        with connection.cursor() as cursor:
            run_cursor(cursor, "SELECT customer_id FROM customers WHERE phone = :phone", {'phone': request.data['phone']})
            row = cursor.fetchone()
            if row:
                customer_id = row[0]
                run_cursor(
                    cursor,
                    "UPDATE customers SET name = :name WHERE customer_id = :customer_id",
                    {'name': request.data['customer'], 'customer_id': customer_id},
                )
            else:
                run_cursor(
                    cursor,
                    "INSERT INTO customers (name, phone, email, address) VALUES (:name, :phone, NULL, :address)",
                    {'name': request.data['customer'], 'phone': request.data['phone'], 'address': request.data.get('address', 'Service counter entry')},
                )
                run_cursor(cursor, "SELECT customer_id FROM customers WHERE phone = :phone", {'phone': request.data['phone']})
                customer_id = cursor.fetchone()[0]

            registration_no = request.data['registration_no'].upper()
            run_cursor(cursor, "SELECT vehicle_id FROM vehicles WHERE registration_no = :registration_no", {'registration_no': registration_no})
            row = cursor.fetchone()
            if row:
                vehicle_id = row[0]
                run_cursor(
                    cursor,
                    "UPDATE vehicles SET customer_id = :customer_id, make = :make, model = :model WHERE vehicle_id = :vehicle_id",
                    {'customer_id': customer_id, 'make': make, 'model': model, 'vehicle_id': vehicle_id},
                )
            else:
                run_cursor(
                    cursor,
                    """
                    INSERT INTO vehicles (customer_id, registration_no, make, model, vehicle_year, fuel_type)
                    VALUES (:customer_id, :registration_no, :make, :model, :vehicle_year, :fuel_type)
                    """,
                    {
                        'customer_id': customer_id,
                        'registration_no': registration_no,
                        'make': make,
                        'model': model,
                        'vehicle_year': datetime.now().year,
                        'fuel_type': request.data.get('fuel_type') or None,
                    },
                )
                run_cursor(cursor, "SELECT vehicle_id FROM vehicles WHERE registration_no = :registration_no", {'registration_no': registration_no})
                vehicle_id = cursor.fetchone()[0]

            run_cursor(
                cursor,
                """
                INSERT INTO service_bookings
                  (customer_id, vehicle_id, service_type, complaint, status, scheduled_at, estimated_cost, created_by)
                VALUES
                  (:customer_id, :vehicle_id, :service_type, :complaint, 'PENDING', :scheduled_at, :estimated_cost, NULL)
                """,
                {
                    'customer_id': customer_id,
                    'vehicle_id': vehicle_id,
                    'service_type': request.data['service_type'],
                    'complaint': request.data.get('complaint') or request.data['service_type'],
                    'scheduled_at': scheduled_at,
                    'estimated_cost': request.data.get('estimated_cost') or 0,
                },
            )
            booking_id = cursor.lastrowid

    return Response({'detail': 'Service booking created in MySQL', 'booking_id': booking_id}, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
def service_status(request, booking_id):
    role = current_role(request)
    if not has_permission(role, 'jobs:update_status'):
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    execute(
        "UPDATE service_bookings SET status = :status WHERE booking_id = :booking_id",
        {'status': request.data.get('status'), 'booking_id': booking_id},
    )
    return Response({'detail': 'Status updated'})


@api_view(['GET'])
def billable_services(request):
    role = current_role(request)
    if not has_permission(role, 'bills:view'):
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    return Response(fetch_all(
        """
        SELECT
          sb.booking_id,
          c.name AS customer_name,
          c.phone,
          v.make,
          v.model,
          v.registration_no,
          sb.service_type,
          sb.status,
          sb.scheduled_at,
          sb.estimated_cost
        FROM service_bookings sb
        JOIN customers c ON c.customer_id = sb.customer_id
        JOIN vehicles v ON v.vehicle_id = sb.vehicle_id
        LEFT JOIN bills b ON b.booking_id = sb.booking_id
        WHERE b.bill_id IS NULL
        ORDER BY sb.scheduled_at DESC
        """
    ))


@api_view(['GET', 'POST'])
def bills(request):
    role = current_role(request)
    if request.method == 'GET':
        if not has_permission(role, 'bills:view'):
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        return Response(fetch_all(
            """
            SELECT
              b.bill_id,
              b.booking_id,
              c.name AS customer_name,
              c.phone,
              v.make,
              v.model,
              v.registration_no,
              sb.service_type,
              b.labor_amount,
              b.parts_amount,
              b.tax_amount,
              b.discount_amount,
              b.total_amount,
              b.bill_status,
              b.generated_at
            FROM bills b
            JOIN service_bookings sb ON sb.booking_id = b.booking_id
            JOIN customers c ON c.customer_id = b.customer_id
            JOIN vehicles v ON v.vehicle_id = sb.vehicle_id
            ORDER BY b.generated_at DESC
            """
        ))

    if not has_permission(role, 'bills:create'):
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    booking_id = request.data.get('booking_id')
    if not booking_id:
        return Response({'detail': 'booking_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    labor = float(request.data.get('labor_amount') or 800)
    parts = float(request.data.get('parts_amount') or 0)
    discount = float(request.data.get('discount_amount') or 0)
    tax = round((labor + parts - discount) * 0.18, 2)
    total = round(labor + parts + tax - discount, 2)

    with transaction.atomic():
        with connection.cursor() as cursor:
            run_cursor(cursor, "SELECT customer_id FROM service_bookings WHERE booking_id = :booking_id", {'booking_id': booking_id})
            row = cursor.fetchone()
            if not row:
                return Response({'detail': 'Service booking not found'}, status=status.HTTP_404_NOT_FOUND)
            customer_id = row[0]
            run_cursor(
                cursor,
                """
                INSERT INTO bills
                  (booking_id, customer_id, labor_amount, parts_amount, tax_amount, discount_amount, total_amount, bill_status, generated_by)
                VALUES
                  (:booking_id, :customer_id, :labor_amount, :parts_amount, :tax_amount, :discount_amount, :total_amount, 'UNPAID', NULL)
                ON DUPLICATE KEY UPDATE
                  labor_amount = VALUES(labor_amount),
                  parts_amount = VALUES(parts_amount),
                  tax_amount = VALUES(tax_amount),
                  discount_amount = VALUES(discount_amount),
                  total_amount = VALUES(total_amount)
                """,
                {
                    'booking_id': booking_id,
                    'customer_id': customer_id,
                    'labor_amount': labor,
                    'parts_amount': parts,
                    'tax_amount': tax,
                    'discount_amount': discount,
                    'total_amount': total,
                },
            )
            bill_id = cursor.lastrowid
            if not bill_id:
                run_cursor(cursor, "SELECT bill_id FROM bills WHERE booking_id = :booking_id", {'booking_id': booking_id})
                bill_id = cursor.fetchone()[0]

    return Response({'detail': 'Bill generated in MySQL', 'bill_id': bill_id, 'total_amount': total}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def payments(request):
    role = current_role(request)
    if not has_permission(role, 'payments:create'):
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    bill_id = request.data.get('bill_id')
    if not bill_id:
        return Response({'detail': 'bill_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        with connection.cursor() as cursor:
            run_cursor(cursor, "SELECT total_amount FROM bills WHERE bill_id = :bill_id", {'bill_id': bill_id})
            row = cursor.fetchone()
            if not row:
                return Response({'detail': 'Bill not found'}, status=status.HTTP_404_NOT_FOUND)
            amount = float(request.data.get('amount') or row[0])
            run_cursor(
                cursor,
                """
                INSERT INTO payments (bill_id, amount, payment_mode, payment_status, transaction_ref, received_by)
                VALUES (:bill_id, :amount, :payment_mode, 'SUCCESS', :transaction_ref, NULL)
                """,
                {
                    'bill_id': bill_id,
                    'amount': amount,
                    'payment_mode': request.data.get('payment_mode') or 'CASH',
                    'transaction_ref': request.data.get('transaction_ref') or f'PAY-{bill_id}-{datetime.now().timestamp()}',
                },
            )
            run_cursor(cursor, "UPDATE bills SET bill_status = 'PAID' WHERE bill_id = :bill_id", {'bill_id': bill_id})

    return Response({'detail': 'Payment recorded in MySQL'})


@api_view(['GET'])
def reports(request):
    if not has_permission(current_role(request), '*'):
        return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    return Response({
        'revenue': fetch_all("SELECT COALESCE(SUM(total_amount), 0) total_revenue FROM bills"),
        'services': fetch_all("SELECT status, COUNT(*) count FROM service_bookings GROUP BY status"),
        'inventory': fetch_all("SELECT part_name, stock_qty, reorder_level FROM inventory ORDER BY stock_qty ASC"),
        'customers': fetch_all("SELECT COUNT(*) total_customers FROM customers"),
        'vehicles': fetch_all("SELECT COUNT(*) total_vehicles FROM vehicles"),
        'bills': fetch_all("SELECT bill_status, COUNT(*) count, COALESCE(SUM(total_amount), 0) amount FROM bills GROUP BY bill_status"),
        'monthly': fetch_all(
            """
            SELECT DATE_FORMAT(generated_at, '%%b') month, COALESCE(SUM(total_amount), 0) revenue
            FROM bills
            GROUP BY DATE_FORMAT(generated_at, '%%Y-%%m'), DATE_FORMAT(generated_at, '%%b')
            ORDER BY MIN(generated_at)
            """
        ),
    })


@api_view(['GET'])
def health(_request):
    return Response({'status': 'ok', 'database': 'mysql'})
