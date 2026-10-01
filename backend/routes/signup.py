from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from pymysql.err import IntegrityError
import bcrypt

from app.database.redis_connection import redis_client
from app.database.users import (
    get_user_by_email,
    get_user_by_mobile,
    create_user
)


router = APIRouter(
    prefix="/thoughtbook",
    tags=["Signup"]
)


class SignupRequest(BaseModel):
    name: str
    mobile: str
    email: EmailStr
    password: str


@router.post("/signup")
def signup(request: SignupRequest):

    name = request.name.strip()
    mobile = request.mobile.strip()
    email = request.email.lower().strip()
    password = request.password

    # -------------------------------------------------
    # BASIC VALIDATION
    # -------------------------------------------------

    if len(name) < 3:
        raise HTTPException(
            status_code=400,
            detail="Name must contain at least 3 characters."
        )

    if not mobile.isdigit() or len(mobile) != 10:
        raise HTTPException(
            status_code=400,
            detail="Enter a valid 10-digit mobile number."
        )

    if len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters."
        )

    # -------------------------------------------------
    # CHECK EMAIL VERIFICATION
    # -------------------------------------------------

    verified_key = f"email_verified:{email}"

    if redis_client.get(verified_key) != "1":
        raise HTTPException(
            status_code=400,
            detail="Please verify your email first."
        )

    # -------------------------------------------------
    # CHECK EXISTING EMAIL
    # -------------------------------------------------

    if get_user_by_email(email):
        raise HTTPException(
            status_code=409,
            detail="User already exists. Please login with your credentials."
        )

    # -------------------------------------------------
    # CHECK EXISTING MOBILE
    # -------------------------------------------------

    if get_user_by_mobile(mobile):
        raise HTTPException(
            status_code=409,
            detail="User already exists. Please login with your credentials."
        )

    # -------------------------------------------------
    # HASH PASSWORD
    # -------------------------------------------------

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # -------------------------------------------------
    # CREATE USER
    # -------------------------------------------------

    try:

        user_id = create_user(
            user_name=name,
            user_email=email,
            user_password=hashed_password,
            user_mobile=mobile,
            auth_provider="email"
        )

    except IntegrityError as e:

        if e.args[0] == 1062:
            raise HTTPException(
                status_code=409,
                detail="User already exists. Please login with your credentials."
            )

        raise HTTPException(
            status_code=500,
            detail="Unable to create account."
        )

    # -------------------------------------------------
    # REMOVE EMAIL VERIFICATION KEY
    # -------------------------------------------------

    redis_client.delete(verified_key)

    # -------------------------------------------------
    # RESPONSE
    # -------------------------------------------------

    return {
        "message": "Account created successfully. Please login.",
        "user_id": user_id
    }