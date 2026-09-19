from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import bcrypt
import pymysql

from app.database.connection import connect_db
from app.database.users import (
    get_user_by_email,
    get_user_by_mobile,
    create_user
)

from .otp import otp_storage


router = APIRouter(
    prefix="/thoughtbook",
    tags=["Signup"]
)


# =========================================================
# REQUEST MODEL
# =========================================================

class SignupRequest(BaseModel):

    name: str
    mobile: str
    email: EmailStr
    password: str


# =========================================================
# SIGNUP
# =========================================================

@router.post("/signup")
def signup(request: SignupRequest):

    name = request.name.strip()
    mobile = request.mobile.strip()
    email = request.email.lower().strip()
    password = request.password

    # =====================================================
    # 1. BASIC VALIDATION
    # =====================================================

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


    # =====================================================
    # 2. CHECK EMAIL OTP VERIFICATION
    # =====================================================

    otp_data = otp_storage.get(email)

    if not otp_data:

        raise HTTPException(
            status_code=400,
            detail="Please verify your email first."
        )


    if not otp_data["verified"]:

        raise HTTPException(
            status_code=400,
            detail="Please verify your email first."
        )


    # =====================================================
    # 3. CHECK EXISTING EMAIL
    # =====================================================

    existing_email = get_user_by_email(email)

    if existing_email:

        raise HTTPException(
            status_code=409,
            detail="User already exists. Please login with your credentials."
        )


    # =====================================================
    # 4. CHECK EXISTING MOBILE
    # =====================================================

    existing_mobile = get_user_by_mobile(mobile)

    if existing_mobile:

        raise HTTPException(
            status_code=409,
            detail="User already exists. Please login with your credentials."
        )


    # =====================================================
    # 5. HASH PASSWORD
    # =====================================================

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


    # =====================================================
    # 6. CREATE USER
    # =====================================================

    try:

        user_id = create_user(
            request.name,
            None,
            request.email,
            request.mobile,
            hashed_password
        )

    except pymysql.err.IntegrityError as e:

        # MySQL duplicate-key protection
        if e.args[0] == 1062:

            raise HTTPException(
                status_code=409,
                detail="User already exists. Please login with your credentials."
            )

        raise HTTPException(
            status_code=500,
            detail="Unable to create account."
        )


    # =====================================================
    # 7. DELETE OTP AFTER SUCCESSFUL SIGNUP
    # =====================================================

    del otp_storage[email]


    # =====================================================
    # 8. RESPONSE
    # =====================================================

    return {
        "message": "Account created successfully. Please login.",
        "user_id": user_id
    }