from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.database.feed import get_user_feed


router = APIRouter()


@router.get("/feed")
def get_feed(
    user_id: str = Depends(get_current_user)
):

    current_user_id = int(user_id)

    posts = get_user_feed(current_user_id)

    return {
        "message": "Feed fetched successfully.",
        "posts": posts
    }