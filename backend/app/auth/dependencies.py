from fastapi import Request, HTTPException
from app.auth.jwt import decode_jwt


def get_current_user(request: Request):

    # Getting JWT from HTTP-only cookie
    access_token = request.cookies.get("access_token")

    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    # Decoding and verifying JWT
    payload = decode_jwt(access_token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    # Getting user ID from JWT
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    return user_id