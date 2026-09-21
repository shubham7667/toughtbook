from fastapi import APIRouter, Depends

from app.database.thoughts import get_post_by_userId

from app.auth.dependencies import get_current_user


router = APIRouter()


@router.get("/get/post")
def get_posts(
    user_id: str = Depends(get_current_user)
):

    posts = get_post_by_userId(user_id)

    return {
        "message": "Post fetched successfully.",
        "posts": posts
    }