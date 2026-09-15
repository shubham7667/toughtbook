from fastapi import APIRouter

router = APIRouter()

@router.get('/hello')
def hello():
    return {
        'message': 'hello this is router page.'
    }