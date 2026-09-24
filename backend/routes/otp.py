import os
import random
import requests

from app.database.redis_connection import redis_client
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv


load_dotenv()
router = APIRouter(
    prefix="/thoughtbook",
    tags=["OTP"]
)

# Requesting models for sending and verifying OTPs
class SendOTPRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


# generating a random 6-digit OTP
def generate_otp():

    return str(
        random.randint(100000, 999999)
    )


# Sending OTP email using Brevo API
def send_email_otp(email: str, otp: str):

    api_key = os.getenv("BREVO_API_KEY")
    sender_email = os.getenv("BREVO_SENDER_EMAIL")


    if not api_key:

        raise HTTPException(
            status_code=500,
            detail="BREVO_API_KEY is not configured"
        )


    if not sender_email:

        raise HTTPException(
            status_code=500,
            detail="BREVO_SENDER_EMAIL is not configured"
        )

    url = "https://api.brevo.com/v3/smtp/email"

    headers = {

        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json"

    }

    data = {

        "sender": {

            "name": "ThoughtBook",
            "email": sender_email

        },

        "to": [

            {

                "email": email

            }

        ],

        "subject":
            "ThoughtBook - Email Verification",

        "textContent": f"""
Hello,

Welcome to ThoughtBook!

Your email verification OTP is:

{otp}

This OTP will expire in 5 minutes.

If you did not request this OTP,
please ignore this email.

Regards,
ThoughtBook Team
"""

}

    try:

        response = requests.post(
            url,
            headers=headers,
            json=data,
            timeout=15
        )


        if response.status_code not in [200, 201]:

            print(
                "Brevo error:",
                response.text
            )

            raise HTTPException(
                status_code=500,
                detail="Failed to send OTP email"
            )

    except requests.RequestException as e:

        print(
            "Brevo connection error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to connect to email service"
        )

# Send OTP route for sending OTP to the user's email
@router.post("/send-otp")
def send_otp(request: SendOTPRequest):

    email = request.email.lower()

    # Generating a random 6-digit OTP
    otp = generate_otp()

    # Send OTP through Brevo
    send_email_otp(email, otp)
    
    otp_key = f"otp:{email}"
    attempts_key = f"otp_attempts:{email}"

    # Storing OTP
    redis_client.setex(
        otp_key,
        300,  # 5 minutes in seconds
        otp
    )
  

    # Store/reset attempts count
    redis_client.setex(
        attempts_key,
        300,  # 5 minutes in seconds
        0
    )


    return {
        "message":"OTP sent successfully"

    }

# Verify OTP route for verifying the OTP entered by the user
@router.post("/verify-otp")
def verify_otp(request: VerifyOTPRequest):

    email = request.email.lower()
    otp = request.otp.strip()

    # Redis keys
    otp_key = f"otp:{email}"
    attempts_key = f"otp_attempts:{email}"

    # Get stored OTP from Redis
    stored_otp = redis_client.get(
        otp_key
    )

    # OTP doesn't exist
    # This also covers expired OTPs
    if stored_otp is None:

        raise HTTPException(
            status_code=400,
            detail="OTP not found or expired. Please request a new OTP."
        )

    # Get number of attempts
    attempts = redis_client.get(
        attempts_key
    )

    if attempts is None:
        attempts = 0
    else:
        attempts = int(attempts)

    # Maximum 5 attempts
    if attempts >= 5:

        redis_client.delete(
            otp_key,
            attempts_key
        )

        raise HTTPException(
            status_code=400,
            detail="Too many incorrect attempts. Please request a new OTP."
        )

    # Comparing OTP
    if otp != stored_otp:

        redis_client.incr(
            attempts_key
        )

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    verified_key = f"email_verified:{email}"

    redis_client.setex(
        verified_key,
        600,
        "1"       "true"
    )
    
    # OTP is correct
    redis_client.delete(
        otp_key,
        attempts_key
    )

    return {
        "message": "Email verified successfully"
    }