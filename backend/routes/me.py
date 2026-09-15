from fastapi import APIRouter, HTTPException, Request
from app.auth.jwt import decode_jwt
from app.database.users import get_user_by_user_id

router = APIRouter()

@router.get("/me")
async def get_current_user(request: Request):

    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    payload = decode_jwt(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_id = payload["sub"]

    user = get_user_by_user_id(user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "Authenticated",
        "user": user
    }