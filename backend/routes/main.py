import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from .admin import router as admin_router
from .admin_auth import router as admin_auth_router
from .get_thought import router as get_post_router
from .login import route as login_router
from .me import router as me_router
from .post_thoughts import router as thought_router

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

session_secret = os.getenv("SESSION_SECRET_KEY")

app.add_middleware(
    SessionMiddleware,
    secret_key=session_secret,
)

app.include_router(me_router)
app.include_router(login_router)
app.include_router(thought_router)
app.include_router(get_post_router)

app.include_router(admin_auth_router)
app.include_router(admin_router)


@app.get("/")
def home():
    return {
        "message": "ThoughtBook backend is running.",
    }