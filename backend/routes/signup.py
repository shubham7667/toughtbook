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

# Requesting a model for signup
class SignupRequest(BaseModel):

    name: str
    mobile: str
    email: EmailStr
    password: str

# Signup route
@router.post("/signup")
def signup(request: SignupRequest):

    name = request.name.strip()
    mobile = request.mobile.strip()
    email = request.email.lower().strip()
    password = request.password

    # basic validation for name, mobile, and password
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
    
    # checking if the email is verified in Redis
    verified_key = f"email_verified:{email}"

    is_verified = redis_client.get(
        verified_key
    )

    if is_verified != "1":

        raise HTTPException(
            status_code=400,
            detail="Please verify your email first."
        )

    # checking if the user already exists in the database
    existing_email = get_user_by_email(
        email
    )

    if existing_email:

        raise HTTPException(
            status_code=409,
            detail="User already exists. Please login with your credentials."
        )

    # checking if the mobile number is already registered in the database
    existing_mobile = get_user_by_mobile(
        mobile
    )

    if existing_mobile:

        raise HTTPException(
            status_code=409,
            detail="User already exists. Please login with your credentials."
        )

    # hashing the password using bcrypt
    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # creating the user in the database
    try:

        user_id = create_user(
            name,
            None,
            email,
            mobile,
            hashed_password
        )

    except IntegrityError as e:

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


    # removing the email verification key from Redis after successful signup
    redis_client.delete(
        verified_key
    )

    # returning a success message along with the user ID
    return {

        "message":
            "Account created successfully. Please login.",

        "user_id":
            user_id

    }