import os
import json

WEB_DEBUG = os.environ.get("DEBUG", False)
SECRET_KEY = os.environ.get("SECRET_KEY", "")
DB_URI = os.environ.get("DATABASE_URI","")

# Discord Setup
DISCORD_CLIENT_ID = os.environ.get("DISCORD_CLIENT_ID","")
DISCORD_SECRET_KEY = os.environ.get("DISCORD_CLIENT_SECRET","")
DISCORD_REDIRECT_URI = os.environ.get("DISCORD_REDIRECT_URI","")
DISCORD_BOT_TOKEN = os.environ.get("DISCORD_BOT_TOKEN", "")
DISCORD_ADMINS = json.loads(os.environ.get('DISCORD_ADMIN_USERS', []))

if WEB_DEBUG:
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "true"