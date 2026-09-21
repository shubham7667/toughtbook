from fastapi import APIRouter, HTTPException, Request
from app.auth.jwt import decode_jwt
from app.database.edit_profile import get_user_profile_by_user_id
from app.database.users import get_user_by_user_id

router = APIRouter()


def normalize_row(row):
    if not row:
        return {}

    normalized = {}

    for key, value in row.items():
        if key is None:
            continue

        normalized[key] = value
        normalized[str(key).upper()] = value
        normalized[str(key).lower()] = value

    return normalized


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
    profile_details = get_user_profile_by_user_id(user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    normalized_user = normalize_row(user)
    normalized_profile = normalize_row(profile_details) if profile_details else {}

    merged_user = {
        **normalized_user,
        "USER_BIO": normalized_profile.get("bio") or normalized_profile.get("BIO") or "",
        "USER_QUOTE": normalized_profile.get("quote") or normalized_profile.get("QUOTE") or "",
        "USER_LOCATION": normalized_profile.get("location") or normalized_profile.get("LOCATION") or "",
        "USER_WEBSITE": normalized_profile.get("website") or normalized_profile.get("WEBSITE") or "",
        "USER_TWITTER": normalized_profile.get("twitter") or normalized_profile.get("TWITTER") or "",
        "USER_INSTAGRAM": normalized_profile.get("instagram") or normalized_profile.get("INSTAGRAM") or "",
        "USER_LANGUAGES": normalized_profile.get("languages") or normalized_profile.get("LANGUAGES") or [],
        "USER_INTERESTS": normalized_profile.get("interests") or normalized_profile.get("INTERESTS") or [],
        "USER_PRIVATE_PROFILE": normalized_profile.get("private_profile") or normalized_profile.get("PRIVATE_PROFILE") or False,
        "USER_SHOW_ACTIVITY": normalized_profile.get("show_activity") or normalized_profile.get("SHOW_ACTIVITY") or True,
        "USER_NOTIFY_FOLLOWERS": normalized_profile.get("notify_followers") or normalized_profile.get("NOTIFY_FOLLOWERS") or True,
        "bio": normalized_profile.get("bio") or normalized_profile.get("BIO") or "",
        "quote": normalized_profile.get("quote") or normalized_profile.get("QUOTE") or "",
        "location": normalized_profile.get("location") or normalized_profile.get("LOCATION") or "",
        "website": normalized_profile.get("website") or normalized_profile.get("WEBSITE") or "",
        "twitter": normalized_profile.get("twitter") or normalized_profile.get("TWITTER") or "",
        "instagram": normalized_profile.get("instagram") or normalized_profile.get("INSTAGRAM") or "",
        "languages": normalized_profile.get("languages") or normalized_profile.get("LANGUAGES") or [],
        "interests": normalized_profile.get("interests") or normalized_profile.get("INTERESTS") or [],
        "private_profile": normalized_profile.get("private_profile") or normalized_profile.get("PRIVATE_PROFILE") or False,
        "show_activity": normalized_profile.get("show_activity") or normalized_profile.get("SHOW_ACTIVITY") or True,
        "notify_followers": normalized_profile.get("notify_followers") or normalized_profile.get("NOTIFY_FOLLOWERS") or True,
    }

    return {
        "message": "Authenticated",
        "user": merged_user,
    }
    
@router.get('/profile')
def get_profile(request:Request):
        access_token = request.cookies.get('access_token')
        if not access_token :
            raise HTTPException(status_code=401,
                                detail='not authorized')
            
        user = decode_jwt(access_token)
        print("DECODED:", user)

        if not user:
            raise HTTPException(
                status_code=401,
                detail="invalid or expired token"
            )

        user_id = user["sub"]
        print("USER ID FROM JWT:", user_id)

        get_user = get_user_by_user_id(user_id)
        profile_details = get_user_profile_by_user_id(user_id)
        print("USER FROM DB:", get_user)

        if not get_user:    
            raise HTTPException(
                status_code=404,
                detail="user not found"
            )

        return {
            "USER_ID": get_user["USER_ID"],
            "USER_NAME": get_user["USER_NAME"],
            "USER_PROFILE_PIC": get_user["USER_PROFILE_PIC"],
            "USER_EMAIL_ID": get_user["USER_EMAIL_ID"],
            "USER_COVER_PIC": get_user["USER_COVER_PIC"],
            "USER_BIO": profile_details["bio"] if profile_details else "",
            "USER_QUOTE": profile_details["quote"] if profile_details else "",
            "USER_LOCATION": profile_details["location"] if profile_details else "",
            "USER_WEBSITE": profile_details["website"] if profile_details else "",
            "USER_TWITTER": profile_details["twitter"] if profile_details else "",
            "USER_INSTAGRAM": profile_details["instagram"] if profile_details else "",
            "USER_LANGUAGES": profile_details["languages"] if profile_details else [],
            "USER_INTERESTS": profile_details["interests"] if profile_details else [],
            "USER_PRIVATE_PROFILE": profile_details["private_profile"] if profile_details else False,
            "USER_SHOW_ACTIVITY": profile_details["show_activity"] if profile_details else True,
            "USER_NOTIFY_FOLLOWERS": profile_details["notify_followers"] if profile_details else True,
        }

            