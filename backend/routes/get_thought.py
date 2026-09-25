from fastapi import APIRouter , HTTPException,Request
from app.database.thoughts import get_post_by_userId
from app.database.thoughts import delete_post_by_post_id
from app.auth.jwt import decode_jwt

router = APIRouter()

@router.get('/get/post')
def get(request:Request):
    access_token = request.cookies.get('access_token')
    if not access_token:
        raise HTTPException(
            status_code=401,
            detail='invalid token or expired token'
        )
    user = decode_jwt(access_token)
    if not user:
        raise HTTPException(
            status_code=401,detail='invalid token or expired token.'
        )
    posts = get_post_by_userId(user['sub'])
    
    
    return{
        'message':'post fetched successfully.',
        'posts':posts
    }


@router.delete('/post/{post_id}')
def delete_post(post_id: int, request: Request):

    access_token = request.cookies.get('access_token')

    if not access_token:
        raise HTTPException(
            status_code=401,
            detail='invalid token or expired token'
        )

    user = decode_jwt(access_token)

    if not user:
        raise HTTPException(
            status_code=401,
            detail='invalid token or expired token'
        )

    deleted = delete_post_by_post_id(
        post_id,
        user['sub']
    )

    if deleted == 0:
        raise HTTPException(
            status_code=404,
            detail='Post not found or you are not allowed to delete this post'
        )

    return {
        'message': 'Post deleted successfully.'
    }