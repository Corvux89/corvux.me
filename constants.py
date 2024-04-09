import os

WEB_DEBUG = os.environ.get("DEBUG", False)
WEB_DEBUG = os.environ.get("DEBUG", True)
SECRET_KEY = os.environ.get("SECRET_KEY", "1234")