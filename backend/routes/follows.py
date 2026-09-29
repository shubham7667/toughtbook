from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.database.follows import (
    create_follow,
    create_unfollow,
    get_follow_status,
    get_followers,
    get_following,
    follower_count,
    following_count,
    get_pending_request,
    accept_follow_request,
    reject_follow_request,
)


router = APIRouter(
    prefix="/thoughtbook",
    tags=["Follows"],
)


# ============================================================
# SEND FOLLOW REQUEST / FOLLOW PUBLIC USER
# ============================================================

@router.post("/follow/{following_id}")
def follow_user(
    following_id: int,
    user_id: str = Depends(get_current_user),
):
    follower_id = int(user_id)

    follow_id = create_follow(
        following_id=following_id,
        follower_id=follower_id,
    )

    status = get_follow_status(
        follower_id=follower_id,
        following_id=following_id,
    )

    return {
        "message": (
            "Follow request sent."
            if status == "requested"
            else "You are now following this user."
        ),
        "follow_id": follow_id,
        "status": status,
    }


# ============================================================
# UNFOLLOW USER
# ============================================================

@router.delete("/follow/{following_id}")
def unfollow_user(
    following_id: int,
    user_id: str = Depends(get_current_user),
):
    follower_id = int(user_id)

    result = create_unfollow(
        following_id=following_id,
        follower_id=follower_id,
    )

    return {
        "message": result["message"],
        "status": "follow",
    }


# ============================================================
# CHECK FOLLOW STATUS
# ============================================================

@router.get("/follow/status/{following_id}")
def follow_status(
    following_id: int,
    user_id: str = Depends(get_current_user),
):
    follower_id = int(user_id)

    status = get_follow_status(
        follower_id=follower_id,
        following_id=following_id,
    )

    return {
        "following_id": following_id,
        "status": status,
    }


# ============================================================
# GET CURRENT USER'S FOLLOWERS
# ============================================================

@router.get("/followers")
def followers(
    user_id: str = Depends(get_current_user),
):
    current_user_id = int(user_id)

    followers_list = get_followers(current_user_id)

    return {
        "followers": followers_list,
        "count": len(followers_list),
    }


# ============================================================
# GET CURRENT USER'S FOLLOWING
# ============================================================

@router.get("/following")
def following(
    user_id: str = Depends(get_current_user),
):
    current_user_id = int(user_id)

    following_list = get_following(current_user_id)

    return {
        "following": following_list,
        "count": len(following_list),
    }


# ============================================================
# FOLLOWER COUNT
# ============================================================

@router.get("/followers/count")
def get_follower_count(
    user_id: str = Depends(get_current_user),
):
    current_user_id = int(user_id)

    count = follower_count(current_user_id)

    return {
        "follower_count": count,
    }


# ============================================================
# FOLLOWING COUNT
# ============================================================

@router.get("/following/count")
def get_following_count(
    user_id: str = Depends(get_current_user),
):
    current_user_id = int(user_id)

    count = following_count(current_user_id)

    return {
        "following_count": count,
    }


# ============================================================
# GET PENDING FOLLOW REQUESTS
# ============================================================

@router.get("/follow/requests")
def pending_follow_requests(
    user_id: str = Depends(get_current_user),
):
    current_user_id = int(user_id)

    requests = get_pending_request(current_user_id)

    return {
        "requests": requests,
        "count": len(requests),
    }


# ============================================================
# ACCEPT FOLLOW REQUEST
# ============================================================

@router.post("/follow/requests/{follow_id}/accept")
def accept_follow(
    follow_id: int,
    user_id: str = Depends(get_current_user),
):
    current_user_id = int(user_id)

    result = accept_follow_request(
        follow_id=follow_id,
        current_user_id=current_user_id,
    )

    return {
        "message": result["message"],
        "status": "accepted",
    }


# ============================================================
# REJECT FOLLOW REQUEST
# ============================================================

@router.delete("/follow/requests/{follow_id}")
def reject_follow(
    follow_id: int,
    user_id: str = Depends(get_current_user),
):
    current_user_id = int(user_id)

    result = reject_follow_request(
        follow_id=follow_id,
        current_user_id=current_user_id,
    )

    return {
        "message": result["message"],
        "status": "rejected",
    }