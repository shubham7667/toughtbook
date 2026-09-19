from fastapi import APIRouter, Request, HTTPException
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config

from app.database.users import (
    create_user,
    get_user_by_id,
    get_user_by_email
)

from app.auth.jwt import generate_jwt

from fastapi.responses import (
    RedirectResponse,
    JSONResponse
)

from pathlib import Path

from pydantic import BaseModel, EmailStr

import bcrypt


# =========================================================
# ROUTER
# =========================================================

route = APIRouter()


# =========================================================
# CONFIG
# =========================================================

config = Config(
    str(
        Path(__file__).resolve().parents[1] / ".env"
    )
)


# =========================================================
# GOOGLE OAUTH
# =========================================================

oauth = OAuth(config)


oauth.register(
    name="google",

    client_id=config("GOOGLE_CLIENT_ID"),

    client_secret=config("GOOGLE_CLIENT_SECRET"),

    server_metadata_url=
        "https://accounts.google.com/.well-known/openid-configuration",

    client_kwargs={
        "scope": "openid email profile"
    }
)


# =========================================================
# MANUAL LOGIN REQUEST MODEL
# =========================================================

class LoginRequest(BaseModel):

    email: EmailStr

    password: str


# =========================================================
# GOOGLE LOGIN
# =========================================================

@route.get("/thoughtbook/login/google")
async def google_login(request: Request):

    redirect_uri = request.url_for(
        "google_callback"
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

    token = await oauth.google.authorize_access_token(request)

    userInfo = token.get("userinfo")

    email = userInfo["email"]

    user = get_user_by_id(email)


    # =====================================================
    # NEW GOOGLE USER
    # =====================================================

    if not user:

        user_id = create_user(
            userInfo["name"],
            userInfo["picture"],
            userInfo["email"]
        )

        access_token = generate_jwt(
            user_id
        )


    # =====================================================
    # EXISTING GOOGLE USER
    # =====================================================

    else:

        user_id = user["USER_ID"]

        access_token = generate_jwt(
            user_id
        )


    # =====================================================
    # REDIRECT TO FEED
    # =====================================================

    response = RedirectResponse(
        url="http://localhost:5173/feed"
    )


    # =====================================================
    # JWT COOKIE
    # =====================================================

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
# MANUAL EMAIL + PASSWORD LOGIN
# =========================================================

@route.post("/thoughtbook/login")
def manual_login(request: LoginRequest):

    # =====================================================
    # CLEAN INPUT
    # =====================================================

    email = request.email.lower().strip()

    password = request.password


    # =====================================================
    # FIND USER BY EMAIL
    # =====================================================

    user = get_user_by_email(email)


    # =====================================================
    # USER DOES NOT EXIST
    # =====================================================

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    # =====================================================
    # GET STORED PASSWORD
    # =====================================================

    stored_password = user.get(
        "USER_PASSWORD"
    )


    # =====================================================
    # GOOGLE USER
    # =====================================================

    if not stored_password:

        raise HTTPException(
            status_code=400,
            detail=(
                "This account uses Google login. "
                "Please login with Google."
            )
        )


    # =====================================================
    # VERIFY PASSWORD
    # =====================================================

    try:

        password_matches = bcrypt.checkpw(
            password.encode("utf-8"),
            stored_password.encode("utf-8")
        )

    except Exception:

        password_matches = False


    # =====================================================
    # INVALID PASSWORD
    # =====================================================

    if not password_matches:

        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )


    # =====================================================
    # GENERATE JWT
    # =====================================================

    access_token = generate_jwt(
        str(user["USER_ID"])
    )


    # =====================================================
    # SUCCESS RESPONSE
    # =====================================================

    response = JSONResponse(
        content={
            "message": "Login successful",
            "user_id": user["USER_ID"]
        }
    )


    # =====================================================
    # STORE JWT IN HTTP-ONLY COOKIE
    # =====================================================

    response.set_cookie(
        key="access_token",

        value=access_token,

        secure=False,

        httponly=True,

        samesite="lax",

        max_age=30 * 60
    )


    return response