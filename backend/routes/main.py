from fastapi import FastAPI
from .me import router
from .login import route as login_router
from .otp import router as otp_router
from .post_thoughts import router as thought_router
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from .get_thought import router as get_post_router
from .signup import router as signup_router
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session middleware for Google OAuth
session_secret = os.getenv("SESSION_SECRET_KEY")

app.add_middleware(
    SessionMiddleware,
    secret_key=session_secret
)

# Routes
app.include_router(otp_router)
app.include_router(router)
app.include_router(login_router)
app.include_router(thought_router)
app.include_router(get_post_router)
app.include_router(signup_router)
@app.get("/")
def home():
    return {
        "message": "hello this is home page."
    }