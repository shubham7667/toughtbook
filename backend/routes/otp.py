import os
import random
import time
import requests

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv


load_dotenv()


router = APIRouter(
    prefix="/thoughtbook",
    tags=["OTP"]
)


# =========================================================
# OTP STORAGE
# =========================================================

otp_storage = {}


# =========================================================
# REQUEST MODELS
# =========================================================

class SendOTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


# =========================================================
# GENERATE OTP
# =========================================================

def generate_otp():

    return str(
        random.randint(100000, 999999)
    )


# =========================================================
# SEND EMAIL USING BREVO
# =========================================================

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


# =========================================================
# SEND OTP
# =========================================================

@router.post("/send-otp")
def send_otp(request: SendOTPRequest):

    email = request.email.lower()


    # Generate OTP

    otp = generate_otp()


    # OTP expiry = 5 minutes

    expires_at = time.time() + (5 * 60)


    # Store OTP

    otp_storage[email] = {

        "otp": otp,

        "expires_at": expires_at,

        "attempts": 0,

        "verified": False

    }


    # Send OTP email

    send_email_otp(
        email,
        otp
    )


    # Development logging
    # Remove this before production

    print(
        f"OTP for {email}: {otp}"
    )


    return {

        "message":
            "OTP sent successfully"

    }


# =========================================================
# VERIFY OTP
# =========================================================

@router.post("/verify-otp")
def verify_otp(request: VerifyOTPRequest):

    email = request.email.lower()

    otp = request.otp


    # Check OTP exists

    if email not in otp_storage:

        raise HTTPException(
            status_code=400,
            detail=
            "OTP not found. Please request a new OTP."
        )


    stored_data = otp_storage[email]


    # Check expiry

    if time.time() > stored_data["expires_at"]:

        del otp_storage[email]

        raise HTTPException(
            status_code=400,
            detail=
            "OTP has expired. Please request a new OTP."
        )


    # Maximum attempts

    if stored_data["attempts"] >= 5:

        del otp_storage[email]

        raise HTTPException(
            status_code=400,
            detail=
            "Too many incorrect attempts. Please request a new OTP."
        )


    # Verify OTP

    if otp != stored_data["otp"]:

        stored_data["attempts"] += 1

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )


    # Mark email as verified

    stored_data["verified"] = True


    return {

        "message":
            "Email verified successfully"

    }