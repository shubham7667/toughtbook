from fastapi import APIRouter, Request, HTTPException
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from pydantic import BaseModel, EmailStr
from fastapi.responses import RedirectResponse, JSONResponse
from dotenv import load_dotenv

from app.auth.jwt import generate_jwt
from app.database.users import (
    get_user_by_email,
    create_user
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

@route.get("/thoughtbook/login/google")
async def google_login(request: Request):

    redirect_uri = request.url_for("google_callback")

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

    token = await oauth.google.authorize_access_token(request)

    user_info = token.get("userinfo")

    if not user_info:
        raise HTTPException(
            status_code=401,
            detail="Unable to retrieve Google user information."
        )

    email = user_info["email"].lower().strip()

    # -----------------------------------------------------
    # ADMIN LOGIN
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # Find existing user
    # -----------------------------------------------------

    user = get_user_by_email(email)

    if user:

        if user["auth_provider"] != "google":
            raise HTTPException(
                status_code=400,
                detail=(
                    "This email is already registered "
                    "with email and password. "
                    "Please use email login."
                )
            )

        user_id = user["user_id"]

    # -----------------------------------------------------
    # Create new Google user
    # -----------------------------------------------------

    else:

        user_id = create_user(
            user_name=user_info.get("name"),
            user_email=email,
            user_profile_pic=user_info.get("picture"),
            auth_provider="google"
        )

    # -----------------------------------------------------
    # Create access token
    # -----------------------------------------------------

    access_token = generate_jwt(str(user_id))

    response = RedirectResponse(
        url="http://localhost:5173/profile"
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
# EMAIL / PASSWORD LOGIN
# =========================================================

class LoginRequest(BaseModel):

    email: EmailStr
    password: str


@route.post("/thoughtbook/login")
def login(request: LoginRequest):

    email = request.email.lower().strip()

    user = get_user_by_email(email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # -----------------------------------------------------
    # Authentication provider
    # -----------------------------------------------------

    if user["auth_provider"] != "email":
        raise HTTPException(
            status_code=400,
            detail=(
                "This account uses Google login. "
                "Please login with Google."
            )
        )

    stored_password = user["user_password"]

    if not stored_password:
        raise HTTPException(
            status_code=400,
            detail="This account does not have a password."
        )

    # -----------------------------------------------------
    # Verify password
    # -----------------------------------------------------

    try:
        password_matches = bcrypt.checkpw(
            request.password.encode("utf-8"),
            stored_password.encode("utf-8")
        )

    except (ValueError, TypeError):
        password_matches = False

    if not password_matches:
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    # -----------------------------------------------------
    # Create access token
    # -----------------------------------------------------

    user_id = user["user_id"]

    access_token = generate_jwt(str(user_id))

    response = JSONResponse(
        content={
            "message": "Login successful",
            "user_id": user_id
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