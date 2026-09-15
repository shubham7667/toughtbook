from fastapi import FastAPI
from .me import router
from .login import route as login_router

from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware

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
app.include_router(router)
app.include_router(login_router)


@app.get("/")
def home():
    return {
        "message": "hello this is home page."
    }