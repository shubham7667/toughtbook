from fastapi import APIRouter, Request, HTTPException
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from pydantic import BaseModel, EmailStr
from fastapi.responses import RedirectResponse, JSONResponse
from dotenv import load_dotenv

from app.auth.jwt import generate_jwt
from app.database.users import (
    get_google_user_by_email,
    create_google_user,
    get_manual_user_by_email
)

import bcrypt
import os


load_dotenv()

admin_email = os.getenv("ADMIN_EMAIL")


route = APIRouter()

config = Config(".env")

oauth = OAuth(config)


oauth.register(
    name="google",
    client_id=config("GOOGLE_CLIENT_ID"),
    client_secret=config("GOOGLE_CLIENT_SECRET"),
    server_metadata_url=(
        "https://accounts.google.com/"
        ".well-known/openid-configuration"
    ),
    client_kwargs={
        "scope": "openid email profile"
    }
)


# =========================================================
# GOOGLE LOGIN
# =========================================================

@route.get(
    "/thoughtbook/login/google"
)
async def google_login(request: Request):

    redirect_uri = request.url_for(
        "google_callback"
    )

    print(
        "REDIRECT URI:",
        redirect_uri
    )

    return await oauth.google.authorize_redirect(
        request,
        redirect_uri
    )


# =========================================================
# GOOGLE CALLBACK
# =========================================================

@route.get(
    "/thoughtbook/auth/google/callback",
    name="google_callback"
)
async def google_callback(request: Request):

    # -----------------------------------------------------
    # Get Google access token
    # -----------------------------------------------------

    token = await oauth.google.authorize_access_token(
        request
    )

    user_info = token.get("userinfo")

    if not user_info:

        raise HTTPException(
            status_code=401,
            detail="Unable to retrieve Google user information."
        )

    email = user_info["email"].lower().strip()

    # =====================================================
    # ADMIN LOGIN
    # =====================================================

    if email == admin_email:

        admin_access_token = generate_jwt(
            email,
            admin_name=user_info.get("name"),
            admin_picture=user_info.get("picture")
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

    # =====================================================
    # NORMAL GOOGLE USER
    # =====================================================

    # Check if Google user already exists
    user = get_google_user_by_email(
        email
    )

    # -----------------------------------------------------
    # Existing Google user
    # -----------------------------------------------------

    if user:

        global_user_id = user["USER_ID"]

    # -----------------------------------------------------
    # New Google user
    # -----------------------------------------------------

    else:

        global_user_id = create_google_user(
            user_name=user_info.get("name"),
            user_profile=user_info.get("picture"),
            user_email=email
        )

    # -----------------------------------------------------
    # Generate JWT using GLOBAL USER ID
    # -----------------------------------------------------

    access_token = generate_jwt(
        str(global_user_id)
    )

    response = RedirectResponse(
        url="http://localhost:5173/feed"
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        secure=False,
        httponly=True,
        samesite="lax",
        max_age=30 * 60
    )

    return response


# =========================================================
# MANUAL LOGIN
# =========================================================

class LoginRequest(BaseModel):

    email: EmailStr
    password: str


@route.post(
    "/thoughtbook/login"
)
def manual_login(request: LoginRequest):

    email = request.email.lower().strip()
    password = request.password

    # -----------------------------------------------------
    # Find manual account
    # -----------------------------------------------------

    user = get_manual_user_by_email(
        email
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # -----------------------------------------------------
    # Get stored password
    # -----------------------------------------------------

    stored_password = user.get(
        "USER_PASSWORD"
    )

    # Google-only account
    if not stored_password:

        raise HTTPException(
            status_code=400,
            detail=(
                "This account uses Google login. "
                "Please login with Google."
            )
        )

    # -----------------------------------------------------
    # Verify password
    # -----------------------------------------------------

    try:

        password_matches = bcrypt.checkpw(
            password.encode("utf-8"),
            stored_password.encode("utf-8")
        )

    except Exception:

        password_matches = False

    if not password_matches:

        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    # -----------------------------------------------------
    # IMPORTANT:
    #
    # manual_login.USER_ID is now the SAME
    # as user_log_details.USER_ID
    # -----------------------------------------------------

    global_user_id = user["USER_ID"]

    # -----------------------------------------------------
    # Generate JWT using GLOBAL USER ID
    # -----------------------------------------------------

    access_token = generate_jwt(
        str(global_user_id)
    )

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    response = JSONResponse(
        content={
            "message": "Login successful",
            "user_id": global_user_id
        }
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        secure=False,
        httponly=True,
        samesite="lax",
        max_age=30 * 60
    )

    return response