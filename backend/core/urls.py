from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health),
    path('auth/login/', views.login),
    path('users/', views.users),
    path('customers/', views.customers),
    path('vehicles/', views.vehicles),
    path('inventory/', views.inventory),
    path('inventory/<int:part_id>/restock/', views.inventory_restock),
    path('suppliers/', views.suppliers),
    path('service-bookings/', views.service_bookings),
    path('service-bookings/<int:booking_id>/status/', views.service_status),
    path('billable-services/', views.billable_services),
    path('bills/', views.bills),
    path('payments/', views.payments),
    path('reports/', views.reports),
]
