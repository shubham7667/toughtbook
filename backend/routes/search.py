from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.database.users import search_users


router = APIRouter(
    prefix="/thoughtbook",
    tags=["Search"]
)


@router.get("/search/users")
def search_users_route(
    q: str = Query(..., min_length=1),
    user_id: str = Depends(get_current_user),
):
    current_user_id = int(user_id)

    users = search_users(
        search_text=q,
        current_user_id=current_user_id,
    )

    return {
        "message": "Users fetched successfully.",
        "users": users,
    }