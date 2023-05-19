"""
Django settings for apollosarcade project.

Generated by 'django-admin startproject' using Django 4.2.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from pathlib import Path
import os, sys

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("APOLLO_SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True # os.environ.get("DEBUG", "False") == "True"

ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS",'127.0.0.1,localhost,*.apollosarcade.com,https://apollos-arcade-u3itp.ondigitalocean.app').split(',')

CSRF_TRUSTED_ORIGINS = ['https://*.apollosarcade.com','https://apollos-arcade-u3itp.ondigitalocean.app']


# Application definition

INSTALLED_APPS = [
    'daphne', 
    'whitenoise.runserver_nostatic',
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_quill",
    "channels",
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'rest_framework',
    'webpack_loader',
    'user_profiles',
    'magic_fifteen',
]

SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "APP": {
            "client_id": os.environ.get("GMAIL_API_CLIENT_ID", None),
            "secret": os.environ.get("GMAIL_API_SECRET", None),
            "key": ""
        },
        "SCOPE": ["https://www.googleapis.com/auth/gmail.send"],
        "AUTH_EXTRA_ARGUMENTS": {"access_type": "offline", "prompt": "consent"},
    }
}

WEBPACK_LOADER = {
    'DEFAULT': {
        'CACHE': not DEBUG,
        'BUNDLE_DIR_NAME': 'dist/', # must end with slash
        'STATS_FILE': os.path.join(BASE_DIR, 'webpack-stats.json'),
        'POLL_INTERVAL': 0.1,
        'TIMEOUT': None, # 0.1
        'IGNORE': [r'.+\.hot-update.js', r'.+\.map']
    }
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    'whitenoise.middleware.WhiteNoiseMiddleware',
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "apollosarcade.middleware.GuestMiddleware",
]

ROOT_URLCONF = "apollosarcade.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            'apollosarcade/templates',
            'apollosarcade/static'
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# Get the Redis URL from the environment variable
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [REDIS_URL],
        },
    },
}

ASGI_APPLICATION = "apollosarcade.asgi.application"

DEVELOPMENT_MODE = True # os.environ.get("DEVELOPMENT_MODE", "False") == "True"

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

from urllib.parse import urlsplit
if DEVELOPMENT_MODE is True:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'apollosarcadedb',
            'USER': 'apollosarcadedb',
            'PASSWORD': os.environ.get("DATABASE_PASSWORD"),
            'HOST': os.environ.get("DATABASE_HOST"),
            'PORT': '25060'
        }
    }
elif len(sys.argv) > 0 and sys.argv[1] != 'collectstatic':
    database_url = os.getenv('DATABASE_URL', None)
    if database_url is None:
        raise Exception("DATABASE_URL environment variable not defined")

    parsed_url = urlsplit(database_url)

    if parsed_url.scheme in ['postgres', 'postgresql']:
        database_engine = 'django.db.backends.postgresql'
    elif parsed_url.scheme == 'mysql':
        database_engine = 'django.db.backends.mysql'
    elif parsed_url.scheme == 'sqlite':
        database_engine = 'django.db.backends.sqlite3'
    else:
        raise ValueError(f"Unsupported database scheme: {parsed_url.scheme}")

    DATABASES = {
        "default": {
            "ENGINE": database_engine,
            "NAME": parsed_url.path[1:],
            "USER": parsed_url.username,
            "PASSWORD": parsed_url.password,
            "HOST": parsed_url.hostname,
            "PORT": parsed_url.port,
        }
    }

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
)

SITE_ID = 1
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
ACCOUNT_AUTHENTICATION_METHOD = 'username_email'
ACCOUNT_EMAIL_REQUIRED = True
LOGIN_REDIRECT_URL = '/'

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", None)
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", None)


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    BASE_DIR / "static",
]
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
