ROLE_PERMISSIONS = {
    'RECEPTION': {'customers', 'vehicles', 'service_bookings', 'bills:view'},
    'MECHANIC': {'jobs:view', 'jobs:update_status', 'service_parts:create', 'inventory:view'},
    'BILLING': {'bills:create', 'bills:view', 'payments:create', 'payments:update'},
    'ADMIN': {'*'},
}


def has_permission(role, permission):
    allowed = ROLE_PERMISSIONS.get(role, set())
    return '*' in allowed or permission in allowed
