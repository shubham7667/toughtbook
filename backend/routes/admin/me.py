from fastapi import APIRouter,Depends
from app.auth.admin.admin_auth import admin_auth_check
router = APIRouter()
@router.get("/admin/me")
async def get_admin_details(admin=Depends(admin_auth_check)):
    return {
        "email": admin.get("sub"),
        "name": admin.get("name"),
        "picture": admin.get("picture")
    }