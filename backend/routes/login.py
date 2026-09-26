from fastapi import APIRouter, Request, HTTPException
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from pathlib import Path
from pydantic import BaseModel, EmailStr
from app.auth.jwt import generate_jwt
import bcrypt
from app.database.users import create_user, get_user_by_email
from fastapi.responses import RedirectResponse, JSONResponse


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

# Start of the Google login flow
@route.get("/thoughtbook/login/google")
async def google_login(request: Request):

    redirect_uri = request.url_for(
        "google_callback"
    )

    return await oauth.google.authorize_redirect(
        request,
        redirect_uri
    )


# Google login callback route
@route.get( "/thoughtbook/auth/google/callback",name="google_callback")
async def google_callback(request: Request):

    token = await oauth.google.authorize_access_token(request)

    userInfo = token.get("userinfo")
    email = userInfo["email"]
    user = get_user_by_email(email)
    # new user, create an account 
    if not user:

        user_id = create_user(
            userInfo["name"],
            userInfo["picture"],
            userInfo["email"]
        )

        access_token = generate_jwt(
            user_id
        )
    # existing user, generate a JWT
    else:

        user_id = user["USER_ID"]

        access_token = generate_jwt(
            user_id
        )
    # Redirect the user to the feed page after successful login
    response = RedirectResponse(
        url="http://localhost:5173/feed"
    )

    # JWT is stored in an HTTP-only cookie for security
    response.set_cookie(
        key="access_token",
        value=access_token,
        secure=False,
        httponly=True,
        samesite="lax",
        max_age=30 * 60
    )

    return response

# Manual login request model
class LoginRequest(BaseModel):

    email: EmailStr

    password: str

# Manual login route for users who prefer to log in with email and password
@route.post("/thoughtbook/login")
def manual_login(request: LoginRequest):

    email = request.email.lower().strip()
    password = request.password
    user = get_user_by_email(email)

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    stored_password = user.get(
        "USER_PASSWORD"
    )

    # google login users will not have a password stored in the database, so we check for that and return an error if they try to log in manually
    if not stored_password:

        raise HTTPException(
            status_code=400,
            detail=(
                "This account uses Google login. "
                "Please login with Google."
            )
        )

    # Verify the provided password against the stored hashed password using bcrypt
    try:

        password_matches = bcrypt.checkpw(
            password.encode("utf-8"),
            stored_password.encode("utf-8")
        )

    except Exception:

        password_matches = False

    # If the password does not match, raise an HTTPException with a 401 status code and an "Invalid password" detail message
    if not password_matches:

        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    access_token = generate_jwt(
        str(user["USER_ID"])
    )

    # Successful login response with a message and the user ID
    response = JSONResponse(
        content={
            "message": "Login successful",
            "user_id": user["USER_ID"]
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