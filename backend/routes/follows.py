from fastapi import APIRouter, Request, HTTPException

from app.auth.jwt import decode_jwt

from app.database.follows import (
    create_follow,
    unfollow_user,
    get_follow_status,
    get_followers,
    get_following,
    get_follower_count,
    get_following_count,
    get_pending_requests,
    accept_follow_request,
    reject_follow_request,
)


router = APIRouter(
    prefix="/follow",
    tags=["Follow"]
)



users_router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# AUTHENTICATION HELPER

def get_current_user(request: Request):

    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    payload = decode_jwt(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid token payload"
        )

    try:
        return int(user_id)

    except (TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid user ID in token"
        )



# 1. FOLLOW USER
# POST /follow/{user_id}


@router.post("/{user_id}")
def follow_user(user_id: int,request: Request):

    current_user_id = get_current_user(request)

    # Cannot follow yourself
    if current_user_id == user_id:

        raise HTTPException(
            status_code=400,
            detail="You cannot follow yourself"
        )

    # Create follow relationship
    create_follow(
        current_user_id,
        user_id
    )

    # Get the relationship after creation
    relationship = get_follow_status(
        current_user_id,
        user_id
    )

    status = None

    if relationship:
        status = relationship.get("status")

    return {
        "message": (
            "Follow request sent"
            if status == "pending"
            else "Follow successful"
        ),
        "target_user_id": user_id,
        "status": status
    }


# =========================================================
# 2. UNFOLLOW USER
# DELETE /follow/{user_id}


@router.delete("/{user_id}")
def unfollow_user_route(
    user_id: int,
    request: Request
):

    current_user_id = get_current_user(request)

    # Cannot unfollow yourself
    if current_user_id == user_id:

        raise HTTPException(
            status_code=400,
            detail="Invalid operation"
        )

    deleted = unfollow_user(
        current_user_id,
        user_id
    )

    if deleted is False:
        raise HTTPException(
            status_code=404,
            detail="Follow relationship not found"
        )

    return {
        "message": "Unfollow successful",
        "target_user_id": user_id
    }


# =========================================================
# 3. CHECK FOLLOW STATUS
# GET /follow/status/{user_id}
# =========================================================

@router.get("/status/{user_id}")
def follow_status(
    user_id: int,
    request: Request
):

    current_user_id = get_current_user(request)

    relationship = get_follow_status(
        current_user_id,
        user_id
    )

    if not relationship:

        return {
            "is_following": False,
            "is_followed_by": False,
            "status": "none"
        }

    status = relationship.get("status")

    return {
        "is_following": status == "accepted",
        "is_followed_by": False,
        "status": status
    }


# =========================================================
# 4. GET FOLLOWERS
# GET /users/{user_id}/followers
# =========================================================

@users_router.get("/{user_id}/followers")
def get_user_followers(
    user_id: int
):

    followers = get_followers(user_id)

    return {
        "user_id": user_id,
        "followers": followers
    }


# =========================================================
# 5. GET FOLLOWING
# GET /users/{user_id}/following
# =========================================================

@users_router.get("/{user_id}/following")
def get_user_following(
    user_id: int
):

    following = get_following(user_id)

    return {
        "user_id": user_id,
        "following": following
    }


# =========================================================
# 6. GET FOLLOW COUNTS
# GET /users/{user_id}/follow-counts
# =========================================================

@users_router.get("/{user_id}/follow-counts")
def get_user_follow_counts(
    user_id: int
):

    followers_count = get_follower_count(
        user_id
    )

    following_count = get_following_count(
        user_id
    )

    return {
        "user_id": user_id,
        "followers": followers_count,
        "following": following_count
    }


# =========================================================
# 7. GET PENDING FOLLOW REQUESTS
# GET /follow/requests
# =========================================================

@router.get("/requests")
def get_follow_requests(
    request: Request
):

    current_user_id = get_current_user(request)

    requests = get_pending_requests(
        current_user_id
    )

    return {
        "requests": requests
    }


# =========================================================
# 8. ACCEPT FOLLOW REQUEST
# POST /follow/requests/{follow_id}/accept
# =========================================================

@router.post("/requests/{follow_id}/accept")
def accept_request(
    follow_id: int,
    request: Request
):

    current_user_id = get_current_user(request)

    accepted = accept_follow_request(
        follow_id,
        current_user_id
    )

    if accepted is False:
        raise HTTPException(
            status_code=404,
            detail="Follow request not found"
        )

    return {
        "message": "Follow request accepted",
        "follow_id": follow_id,
        "status": "accepted"
    }


# =========================================================
# 9. REJECT FOLLOW REQUEST
# DELETE /follow/requests/{follow_id}/reject
# =========================================================

@router.delete("/requests/{follow_id}/reject")
def reject_request(
    follow_id: int,
    request: Request
):

    current_user_id = get_current_user(request)

    rejected = reject_follow_request(
        follow_id,
        current_user_id
    )

    if rejected is False:
        raise HTTPException(
            status_code=404,
            detail="Follow request not found"
        )

    return {
        "message": "Follow request rejected",
        "follow_id": follow_id
    }