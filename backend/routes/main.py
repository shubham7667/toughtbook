from fastapi import FastAPI
from .route import router
from starlette.middleware.sessions import SessionMiddleware
import os
from dotenv import load_dotenv
from .login import route as login_router
load_dotenv()
app = FastAPI()

app.include_router(router)
app.include_router(login_router)
session_secret = os.getenv('SESSION_SECRET_KEY')
print(session_secret)
app.add_middleware(
    SessionMiddleware,
    secret_key=session_secret
)
@app.get('/')
def home():
    return {
        'message': 'hello this is home page.'
    }           