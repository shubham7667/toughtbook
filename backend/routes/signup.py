from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from pymysql.err import IntegrityError
import bcrypt

from app.database.redis_connection import redis_client
from app.database.users import (
    get_manual_user_by_email,
    get_manual_user_by_mobile,
    create_manual_user
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

    is_verified = redis_client.get(
        verified_key
    )

    if is_verified != "1":

        raise HTTPException(
            status_code=400,
            detail="Please verify your email first."
        )

    # -------------------------------------------------
    # CHECK EXISTING MANUAL ACCOUNT
    # -------------------------------------------------

    existing_email = get_manual_user_by_email(
        email
    )

    if existing_email:

        raise HTTPException(
            status_code=409,
            detail="User already exists. Please login with your credentials."
        )

    # -------------------------------------------------
    # CHECK EXISTING MOBILE
    # -------------------------------------------------

    existing_mobile = get_manual_user_by_mobile(
        mobile
    )

    if existing_mobile:

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
    # CREATE GLOBAL USER + MANUAL LOGIN USER
    # -------------------------------------------------

    try:

        user_id = create_manual_user(
            user_name=name,
            user_email=email,
            user_mobile=mobile,
            user_password=hashed_password
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

    redis_client.delete(
        verified_key
    )

    # -------------------------------------------------
    # RESPONSE
    # -------------------------------------------------

    return {

        "message":
            "Account created successfully. Please login.",

        "user_id":
            user_id

    }