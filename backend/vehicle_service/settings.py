import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
load_dotenv(PROJECT_ROOT / '.env')

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'dbms-project-dev-key')
DEBUG = os.getenv('DJANGO_DEBUG', 'true').lower() == 'true'
ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        'DJANGO_ALLOWED_HOSTS',
        'localhost,127.0.0.1,.vercel.app,upchuck-sneer-yeah.ngrok-free.dev',
    ).split(',')
    if host.strip()
]

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'core',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

ROOT_URLCONF = 'vehicle_service.urls'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
STATIC_URL = 'static/'
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://upchuck-sneer-yeah.ngrok-free.dev',
]
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://.*\.vercel\.app$',
]

MYSQL_USER = os.getenv('MySQL_user', os.getenv('MYSQL_USER', 'root')).strip('"')
MYSQL_PASSWORD = os.getenv('MySQL_password', os.getenv('MYSQL_PASSWORD', os.getenv('MySQL', ''))).strip('"')
MYSQL_HOST = os.getenv('MySQL_host', os.getenv('MYSQL_HOST', 'localhost')).strip('"')
MYSQL_PORT = os.getenv('MySQL_port', os.getenv('MYSQL_PORT', '3306')).strip('"')
MYSQL_DATABASE = os.getenv('MySQL_database', os.getenv('MYSQL_DATABASE', 'vehicle_service_db')).strip('"')
MYSQL_SSL = os.getenv('MYSQL_SSL', 'false').strip('"').lower() in {'1', 'true', 'yes', 'y'}

MYSQL_OPTIONS = {
    'charset': 'utf8mb4',
    'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
}
if MYSQL_SSL:
    MYSQL_OPTIONS['ssl'] = {}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': MYSQL_DATABASE,
        'USER': MYSQL_USER,
        'PASSWORD': MYSQL_PASSWORD,
        'HOST': MYSQL_HOST,
        'PORT': MYSQL_PORT,
        'OPTIONS': MYSQL_OPTIONS,
    }
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [],
}
