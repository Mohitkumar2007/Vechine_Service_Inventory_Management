from django.urls import path, include

urlpatterns = [
    path('api/', include('core.urls')),
    path('_/backend/api/', include('core.urls')),
]
