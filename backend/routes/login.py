from fastapi import APIRouter, Request
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from app.database.connection import connect_db
from app.database.users import create_user
from app.database.users import get_user_by_id
from app.auth.jwt import generate_jwt
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
import os

load_dotenv()

admin_email= os.getenv('ADMIN_EMAIL')


route = APIRouter()
config = Config(".env")

oauth = OAuth(config)

oauth.register(
    name="google",
    client_id=config("GOOGLE_CLIENT_ID"),
    client_secret=config("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile"
    }
)


# Start Google OAuth
@route.get("/thoughtbook/login/google")
async def google_login(request: Request):

    redirect_uri = request.url_for("google_callback")
    print("REDIRECT URI:", redirect_uri)
    return await oauth.google.authorize_redirect(
        request,
        redirect_uri
    )

# Google OAuth callback
@route.get("/thoughtbook/auth/google/callback", name="google_callback")
async def google_callback(request: Request):

    token = await oauth.google.authorize_access_token(request)

    userInfo = token.get("userinfo")

    email = userInfo["email"]

    # ==================================================
    # ADMIN LOGIN
    # ==================================================

    if email == admin_email:

        admin_access_token = generate_jwt(
            email,
            admin_name=userInfo.get("name"),
            admin_picture=userInfo.get("picture")
        )

        response = RedirectResponse(
            url="http://localhost:5173/thought_says"
        )

        response.set_cookie(
            key="admin_access_token",
            value=admin_access_token,
            secure=False,
            httponly=True,
            samesite="lax"
        )

        return response

    # ==================================================
    # NORMAL USER LOGIN
    # ==================================================

    user = get_user_by_id(email)

    if not user:

        user_id = create_user(
            userInfo["name"],
            userInfo["picture"],
            userInfo["email"]
        )

        access_token = generate_jwt(user_id)

    else:

        user_id = user["USER_ID"]

        access_token = generate_jwt(user_id)

    response = RedirectResponse(
        url="http://localhost:5173/feed"
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        secure=False,
        httponly=True,
        samesite="lax"
    )

    return response