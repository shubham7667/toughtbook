from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from pydantic import BaseModel, Field

from app.auth.dependencies import get_current_user

from app.database.thoughts import (
    like_thought,
    unlike_thought,
    has_user_liked,
    get_like_count,
    add_comment,
    get_comments,
    delete_comment,
    thought_exists
)


router = APIRouter(
    prefix="/thought",
    tags=["Thought Interactions"]
)


# =========================================================
# COMMENT REQUEST
# =========================================================

class CommentRequest(BaseModel):

    comment: str = Field(
        ...,
        min_length=1,
        max_length=1000
    )


# =========================================================
# LIKE
# =========================================================

@router.post("/{thought_id}/like")
def like_post(
    thought_id: int,
    user_id: str = Depends(get_current_user)
):

    # -----------------------------------------------------
    # CHECK POST
    # -----------------------------------------------------

    if not thought_exists(thought_id):

        raise HTTPException(
            status_code=404,
            detail="Thought not found"
        )


    # -----------------------------------------------------
    # CHECK ALREADY LIKED
    # -----------------------------------------------------

    if has_user_liked(
        thought_id,
        int(user_id)
    ):

        return {
            "message": "Already liked",
            "liked": True,
            "like_count": get_like_count(
                thought_id
            )
        }


    # -----------------------------------------------------
    # ADD LIKE
    # -----------------------------------------------------

    try:

        like_thought(
            thought_id,
            int(user_id)
        )

    except Exception as error:

        print(
            "LIKE DATABASE ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Unable to like thought: {str(error)}"
        )


    return {
        "message": "Thought liked",
        "liked": True,
        "like_count": get_like_count(
            thought_id
        )
    }


# =========================================================
# UNLIKE
# =========================================================

@router.delete("/{thought_id}/like")
def unlike_post(
    thought_id: int,
    user_id: str = Depends(get_current_user)
):

    if not thought_exists(thought_id):

        raise HTTPException(
            status_code=404,
            detail="Thought not found"
        )


    unlike_thought(
        thought_id,
        int(user_id)
    )


    return {
        "message": "Thought unliked",
        "liked": False,
        "like_count": get_like_count(
            thought_id
        )
    }


# =========================================================
# LIKE STATUS
# =========================================================

@router.get("/{thought_id}/like")
def get_like_status(
    thought_id: int,
    user_id: str = Depends(get_current_user)
):

    if not thought_exists(thought_id):

        raise HTTPException(
            status_code=404,
            detail="Thought not found"
        )


    liked = has_user_liked(
        thought_id,
        int(user_id)
    )


    return {
        "liked": liked,
        "like_count": get_like_count(
            thought_id
        )
    }


# =========================================================
# ADD COMMENT
# =========================================================

@router.post("/{thought_id}/comment")
def create_comment(
    thought_id: int,
    data: CommentRequest,
    user_id: str = Depends(get_current_user)
):

    if not thought_exists(thought_id):

        raise HTTPException(
            status_code=404,
            detail="Thought not found"
        )


    comment = data.comment.strip()


    if not comment:

        raise HTTPException(
            status_code=400,
            detail="Comment cannot be empty"
        )


    try:

        comment_id = add_comment(
            thought_id,
            int(user_id),
            comment
        )

    except Exception as error:

        print(
            "COMMENT DATABASE ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Unable to add comment: {str(error)}"
        )


    return {
        "message": "Comment added successfully",
        "comment_id": comment_id,
        "comment": comment
    }


# =========================================================
# GET COMMENTS
# =========================================================

@router.get("/{thought_id}/comments")
def fetch_comments(
    thought_id: int
):

    if not thought_exists(thought_id):

        raise HTTPException(
            status_code=404,
            detail="Thought not found"
        )


    comments = get_comments(
        thought_id
    )


    return {
        "comments": comments
    }


# =========================================================
# DELETE COMMENT
# =========================================================

@router.delete("/comment/{comment_id}")
def remove_comment(
    comment_id: int,
    user_id: str = Depends(get_current_user)
):

    deleted = delete_comment(
        comment_id,
        int(user_id)
    )


    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Comment not found or you are not the owner"
        )


    return {
        "message": "Comment deleted successfully"
    }