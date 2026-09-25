from fastapi import APIRouter,Request,Depends,HTTPException
from datetime import datetime,timedelta
from app.database.admin.thought_says import create_thoughtbook_says_thought,get_all_thoughtbook_says_thought,get_current_thoughtbook_says_thought,get_thought_says_by_id,delete_thoughtbook_says_thought,update_thoughtbook_says_thought
from pydantic import BaseModel
from app.auth.admin.admin_auth import admin_auth_check
router = APIRouter()

class ThoughtSchema(BaseModel):
    thought:str
@router.post('/admin/thoughtbook-says')
async def create_thought(data:ThoughtSchema,admin=Depends(admin_auth_check)):
    created_at = datetime.now()
    expires_at = created_at+timedelta(hours=24)
    thought_id = create_thoughtbook_says_thought(data.thought,expires_at)
    
    return{
        'message':'Thought created by admin successful',
        'thought_id':thought_id,
        'admin':admin
    }
    
@router.get("/thoughtbook-says/current")
@router.get("/admin/thoughtbook-says/current")
async def get_current_thoughtbook_says():

    thought = get_current_thoughtbook_says_thought()

    if not thought:
        return {
            "thought": None
        }

    return {
        "thought": thought
    }


@router.get("/admin/thoughtbook-says/all")
async def get_all_thoughtbook_says():

    thoughts = get_all_thoughtbook_says_thought()

    return {
        "thoughts": thoughts
    }

@router.delete('/admin/thoughtbook-says/delete/{thought_id}')
async def delete_thought(thought_id:int,admin=Depends(admin_auth_check)):
    get_thought =get_thought_says_by_id(thought_id)
    if not get_thought:
        raise HTTPException(status_code=404,
                            detail='Thought not found')
        
    delete_thoughtbook_says_thought(thought_id)
    
    return{
        'message':'thought deleted successfully.',
        'thought_id':thought_id,
        'admin':admin
    }
    
@router.patch('/admin/thoughtbook-says/update/{thought_id}')
def update(data: ThoughtSchema, thought_id: int, admin=Depends(admin_auth_check)):
    get_thought = get_thought_says_by_id(thought_id)
    if not get_thought:
        raise HTTPException(status_code=404,
                            detail='Thought not found.')
    update_thoughtbook_says_thought(thought_id, data.thought)
    return{
        'message':'thought updated successfully',
        'thought_id': thought_id,
        'admin': admin
    }


