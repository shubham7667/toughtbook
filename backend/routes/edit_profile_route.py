from pydantic import BaseModel
from fastapi import HTTPException,APIRouter,Request
import json
from app.auth.jwt import decode_jwt
from app.database.edit_profile import save_user_profile
from app.database.edit_profile import get_user_profile
from app.database.users import get_user_by_user_id
# from app.database.update import get_user_profile
class UserProfile(BaseModel):
    bio: str | None = None
    quote: str | None = None
    location: str | None = None
    website: str | None = None
    twitter: str | None = None
    instagram: str | None = None
    languages: list[str] = []
    interests: list[str] = []
    private_profile: bool = False
    show_activity: bool = True
    notify_followers: bool = True

router = APIRouter()

@router.patch("/user_bio")
async def save_profile(request: Request, profile: UserProfile):

    access_token = request.cookies.get("access_token")

    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    user = decode_jwt(access_token)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_id = user["sub"]

    save_user_profile(
        user_id=user_id,
        bio=profile.bio,
        quote=profile.quote,
        location=profile.location,
        website=profile.website,
        twitter=profile.twitter,
        instagram=profile.instagram,
        languages=json.dumps(profile.languages),
        interests=json.dumps(profile.interests),
        private_profile=profile.private_profile,
        show_activity=profile.show_activity,
        notify_followers=profile.notify_followers
    )

    return {
        "message": "Profile updated successfully"
    }
@router.get("/profile")
async def get_profile(request: Request):

    access_token = request.cookies.get("access_token")

    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    user = decode_jwt(access_token)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_id = user["sub"]

    user_details = get_user_by_user_id(user_id)
    profile = get_user_profile(user_id)

    if not user_details:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "user": user_details,
        "profile": profile
    }