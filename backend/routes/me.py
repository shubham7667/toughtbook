from fastapi import APIRouter, HTTPException, Depends

from app.auth.dependencies import get_current_user
from app.database.users import get_user_by_id
from app.database.edit_profile import get_user_profile_by_user_id


router = APIRouter()


# =========================================================
# BUILD USER PROFILE RESPONSE
# =========================================================

def build_user_response(user, profile_details=None):

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    profile = profile_details or {}

    return {
        "USER_ID": user["user_id"],
        "USER_NAME": user["user_name"],
        "USER_PROFILE_PIC": user["user_profile_pic"],
        "USER_EMAIL_ID": user["user_email_id"],
        "USER_COVER_PIC": user["user_cover_pic"],

        "USER_BIO": profile.get("bio") or "",
        "USER_QUOTE": profile.get("quote") or "",
        "USER_LOCATION": profile.get("location") or "",
        "USER_WEBSITE": profile.get("website") or "",
        "USER_TWITTER": profile.get("twitter") or "",
        "USER_INSTAGRAM": profile.get("instagram") or "",

        "USER_LANGUAGES": (
            profile["languages"]
            if profile.get("languages") is not None
            else []
        ),

        "USER_INTERESTS": (
            profile["interests"]
            if profile.get("interests") is not None
            else []
        ),

        "USER_PRIVATE_PROFILE": (
            profile["private_profile"]
            if profile.get("private_profile") is not None
            else False
        ),

        "USER_SHOW_ACTIVITY": (
            profile["show_activity"]
            if profile.get("show_activity") is not None
            else True
        ),

        "USER_NOTIFY_FOLLOWERS": (
            profile["notify_followers"]
            if profile.get("notify_followers") is not None
            else True
        ),
    }


# =========================================================
# CURRENT USER
# =========================================================

@router.get("/me")
def get_current_user_data(
    user_id: str = Depends(get_current_user)
):

    user_id = int(user_id)

    user = get_user_by_id(user_id)
    profile_details = get_user_profile_by_user_id(user_id)

    return {
        "message": "Authenticated",
        "user": build_user_response(
            user,
            profile_details
        )
    }


# =========================================================
# PROFILE
# =========================================================

@router.get("/profile")
def get_profile(
    user_id: str = Depends(get_current_user)
):

    user_id = int(user_id)

    user = get_user_by_id(user_id)
    profile_details = get_user_profile_by_user_id(user_id)

    return build_user_response(
        user,
        profile_details
    )