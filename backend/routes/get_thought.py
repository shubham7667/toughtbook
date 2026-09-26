from fastapi import APIRouter, Request
from app.database.thoughts import get_post_by_userId
from app.auth.dependencies import get_current_user

router = APIRouter()

@router.get('/get/post')
def get(request: Request):

    user_id = get_current_user(request)

    posts = get_post_by_userId(user_id)

    return {
        'message': 'post fetched successfully.',
        'posts': posts
}