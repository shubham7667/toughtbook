from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends

from app.database.thoughts import insert_thoughtPost
from app.auth.dependencies import get_current_user


class ThoughtSchema(BaseModel):

    thought: str = Field(
        ...,
        min_length=1,
        max_length=5000
    )


router = APIRouter()


@router.post("/thought/post")
async def post_thought(
    data: ThoughtSchema,
    user_id: str = Depends(get_current_user)
):

    post_id = insert_thoughtPost(
        user_id=user_id,
        thought=data.thought.strip()
    )

    return {
        "message": "Your thought was posted successfully.",
        "post_id": post_id
    }