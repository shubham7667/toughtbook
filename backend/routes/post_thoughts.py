from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Request, status
from app.database.thoughts import insert_thoughtPost
from app.auth.jwt import decode_jwt


class ThoughtSchema(BaseModel):
    thought: str = Field(..., min_length=1, max_length=5000)


router = APIRouter()

@router.post('/thought/post')
async def post_thought(data: ThoughtSchema, request: Request):
    access_token = request.cookies.get('access_token')
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Authentication required',
        )

    user = decode_jwt(access_token)
    if not user or 'sub' not in user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid or expired access token',
        )

    post_id = insert_thoughtPost(
        user_id=user['sub'],
        thought=data.thought.strip(),
    )
    return {
        'message': 'Your thought was posted successfully.',
        'post_id': post_id,
    }
