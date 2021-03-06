from .base import *
from logging.config import dictConfig

# tlt hostnames
ALLOWED_HOSTS = ['.tlt.harvard.edu']

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = SECURE_SETTINGS['django_secret_key']

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = SECURE_SETTINGS['enable_debug']

# AWS Email Settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'email-smtp.us-east-1.amazonaws.com'
EMAIL_USE_TLS = True
# Amazon Elastic Compute Cloud (Amazon EC2) throttles email traffic over port 25 by default.
# To avoid timeouts when sending email through the SMTP endpoint from EC2, use a different
# port (587 or 2587)
EMAIL_PORT = 587
EMAIL_HOST_USER = SECURE_SETTINGS.get('email_host_user', '')
EMAIL_HOST_PASSWORD = SECURE_SETTINGS.get('email_host_password', '')

# SSL is terminated at the ELB so look for this header to know that we should be in ssl mode
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True

CONCLUDE_COURSES_URL = SECURE_SETTINGS['conclude_courses_url']

# make sure dictConfig(LOGGING) stays at the bottom of the file
dictConfig(LOGGING)
