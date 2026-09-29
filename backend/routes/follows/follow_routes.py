from fastapi import APIRouter,Request,Depends
from app.database.follow.follows import (
create_follow,
reject_follow_request,
accept_follow_request,
get_pending_request,
following_count,
follower_count,

get_followers,
get_follow_status,
create_unfollow,
)
from ..me import get_current_user

router = APIRouter(tags=['Follow/unfollow routes'])

def _current_user_id(current_user):
    user = current_user.get('user', current_user)
    return user.get('user_id', user.get('USER_ID'))


@router.get('/followroutes')
def greet():
    return {
        'message':'hello from follow unfollow routes.'
    }



@router.post('/{following_id}')
def create_follow_db(
    following_id: int,
    current_user=Depends(get_current_user)
):
    follower_id = _current_user_id(current_user)

    
    return  create_follow(
            following_id,
            follower_id
        )
    
    
@router.post('/reject_follow/{follow_id}')
def reject_follow(follow_id:int,current_user=Depends(get_current_user)) :
    current_user_id = _current_user_id(current_user)
    
    return reject_follow_request(follow_id,current_user_id)  
    
    
@router.post('/accept_follow/{follow_id}')
def accept_follow(follow_id:int,current_user=Depends(get_current_user)):
    following_id = _current_user_id(current_user)
    return accept_follow_request(follow_id,following_id)

@router.get('/get_pending_request')
def pending_request(current_user=Depends(get_current_user)):
    following_id = _current_user_id(current_user)
    return get_pending_request(following_id)
    
    


@router.get('following_count')
def get_following_count(current_user=Depends(get_current_user)):
    user_id = _current_user_id(current_user)
    return following_count(user_id)

@router.get('/follower_count')
def get_follower_count(current_user=Depends(get_current_user)):
    user_id = _current_user_id(current_user)
    return follower_count(user_id)
    
    

@router.get('/get_followers')
def get_follower(current_user=Depends(get_current_user)):
    user_id = _current_user_id(current_user)
    return get_followers(user_id)


@router.get('/get_follow_status')
def follow_stat(follower_id,current_user=Depends(get_current_user)):
    following_id = _current_user_id(current_user)
    return get_follow_status(follower_id,following_id)


@router.post('/unfollow/{follower_id}')
def unfollow(follower_id,current_user=Depends(get_current_user)):
    following_id = _current_user_id(current_user)
    return create_unfollow(following_id,follower_id)
