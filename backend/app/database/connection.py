import pymysql
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()


def connect_db():

    connection = pymysql.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT", 3306)),
        cursorclass=pymysql.cursors.DictCursor,
        ssl={"ca": r"D:\Thoughtbook\toughtbook\ca.pem"}
    )

    return connection