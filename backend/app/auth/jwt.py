import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv

load_dotenv()

jwt_secretkey = os.getenv("JWT_SECRET_KEY")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_TIME = 30
ADMIN_TOKEN_EXPIRE_HOURS = 8


def generate_jwt(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_TIME
    )

    payload = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }

    token = jwt.encode(
        payload,
        jwt_secretkey,
        algorithm=ALGORITHM,
    )

    return token


def generate_admin_jwt(admin_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        hours=ADMIN_TOKEN_EXPIRE_HOURS
    )

    payload = {
        "sub": str(admin_id),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "admin",
    }

    token = jwt.encode(
        payload,
        jwt_secretkey,
        algorithm=ALGORITHM,
    )

    return token


def decode_jwt(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token,
            jwt_secretkey,
            algorithms=[ALGORITHM],
        )

        return payload

    except jwt.ExpiredSignatureError:
        return None

    except jwt.InvalidTokenError:
        return None