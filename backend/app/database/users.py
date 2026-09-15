import pymysql
from app.database.connection import connect_db


def get_user_by_id(email:str):
    connection = connect_db()
    cursor = connection.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute(
            '''
            SELECT USER_EMAIL_ID, USER_ID
            FROM USER_LOG_DETAILS
            WHERE USER_EMAIL_ID = %s
            ''',
           (email,)
           
        )
        user=cursor.fetchone()
        return user
    finally:
        cursor.close()
        connection.close()
        

def create_user(
                user_name:str,
                user_profile:str,
                user_email:str):
    connection = connect_db()
    cursor=connection.cursor()
    try:
        cursor.execute(
            '''
            INSERT INTO USER_LOG_DETAILS(
                USER_NAME,
                USER_PROFILE_PIC,
                USER_EMAIL_ID
            )VALUES (%s,%s,%s)
            ''',
           ( 
            user_name,
            user_profile,
            user_email
            )
            
        )
        connection.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        connection.close()