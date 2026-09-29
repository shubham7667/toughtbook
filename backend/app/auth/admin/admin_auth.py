from fastapi import HTTPException,Request
from ..jwt import decode_admin_jwt


def admin_auth_check(request:Request):
    token = request.cookies.get('admin_access_token')
    print('token',token)
    if not token:
        raise HTTPException(
            status_code=401,
            detail='not authorized or invalid token.'
        )
    payload = decode_admin_jwt(token)
    if not payload:
        raise HTTPException(
            status_code=401,
            detail='not Authorized ony admin can access this endpoint.'
        )
    return payload