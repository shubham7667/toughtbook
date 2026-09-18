from fastapi import APIRouter,HTTPException,Request,UploadFile,File
from app.database.update import update_dp
from app.database.update import update_cover as update_cover_db
import cloudinary.uploader
from app.auth.jwt import decode_jwt

router = APIRouter()


@router.post("/profile/update-photo")
async def upload_profile_pic(
    request:Request ,
    file:UploadFile=File(...)):
    
    
    access_token = request.cookies.get('access_token')
    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    user = decode_jwt(access_token)
    if not user:
        raise HTTPException(status_code=401,detail='Invalid token or expired token.')
    
    user_id = user['sub']
    result = cloudinary.uploader.upload(
        file.file,
        folder = 'thoughtbook/profile_pictures',
        public_id = f'user_{user_id}',
        overwrite=True
    )
    
    profile_pic_url = result['secure_url']
    update_dp(user_id,profile_pic_url)
    
    return {
        'message':'Profile photo updated successfully',
        'profile_pic_url':result['secure_url']
    }


@router.post('/profile/update-cover')
def update_cover_photo(request: Request, file: UploadFile = File(...)):

    access_token = request.cookies.get('access_token')

    if not access_token:
        raise HTTPException(
            status_code=401,
            detail='Not authorized...'
        )

    user = decode_jwt(access_token)

    if not user:
        raise HTTPException(
            status_code=401,
            detail='Invalid or expired token.'
        )

    user_id = user['sub']
    
    result = cloudinary.uploader.upload(
        file.file,
        folder='thoughtbook/cover_photo',
        public_id=f'user_{user_id}_cover',
        overwrite=True
    )

    cover_pic_url = result['secure_url']

    update_cover_db(user_id, cover_pic_url)

    return {
        'message': 'Cover photo updated successfully',
        'cover_pic_url': cover_pic_url
    }