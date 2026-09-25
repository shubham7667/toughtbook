import jwt
from dotenv import load_dotenv
import os
from datetime import datetime,timedelta,timezone
from fastapi import HTTPException

load_dotenv()
jwt_secretkey = os.getenv('JWT_SECRET_KEY')
ALGORITHM='HS256'
ACESS_TOKEN_EXPIRE_TIME=30
admin_email= os.getenv('ADMIN_EMAIL')




def generate_jwt(
    user_id: str,
    admin_name=None,
    admin_picture=None
) -> str:

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACESS_TOKEN_EXPIRE_TIME
    )

    # ==================================================
    # ADMIN JWT
    # ==================================================

    if user_id == admin_email:

        payload = {
            "sub": user_id,
            "role": "admin",
            "name": admin_name,
            "picture": admin_picture,
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "access"
        }

    # ==================================================
    # NORMAL USER JWT
    # ==================================================

    else:

        payload = {
            "sub": str(user_id),
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "access"
        }

    token = jwt.encode(
        payload,
        jwt_secretkey,
        algorithm=ALGORITHM
    )

    return token

def decode_jwt(token:str)->dict|None:
    try:
       payload= jwt.decode(
            token,
            jwt_secretkey,
            algorithms=[ALGORITHM]
        )
       return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def decode_admin_jwt(token: str):
    try:
        payload = jwt.decode(
            token,
            jwt_secretkey,
            algorithms=[ALGORITHM]
        )

        if payload.get('role') == 'admin':
            return payload

        return None

    except jwt.ExpiredSignatureError:
        return None

    except jwt.InvalidTokenError:
        return None