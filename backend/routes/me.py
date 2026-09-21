from fastapi import APIRouter, HTTPException, Depends

from app.auth.dependencies import get_current_user
from app.database.users import get_user_by_user_id


router = APIRouter()


@router.get("/me")
async def get_current_user_data(
    user_id: str = Depends(get_current_user)
):

    user = get_user_by_user_id(user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "Authenticated",
        "user": {
            "USER_ID": user["USER_ID"],
            "USER_NAME": user["USER_NAME"],
            "USER_PROFILE_PIC": user["USER_PROFILE_PIC"],
            "USER_EMAIL_ID": user["USER_EMAIL_ID"],
            "USER_MOBILE_NUMBER": user["USER_MOBILE_NUMBER"]
        }
    }