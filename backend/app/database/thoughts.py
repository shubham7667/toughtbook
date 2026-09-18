from .connection import connect_db


def insert_thoughtPost(user_id: int, thought: str):
    connection = connect_db()
    cursor = connection.cursor()
    try:
        cursor.execute(
        '''
         insert into thought(user_id,thought) 
         values(%s,%s)
        ''', (user_id, thought)
        
        )
        connection.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        connection.close()
        

def get_post_by_userId(user_id):
    connection = connect_db()
    cursor = connection.cursor()
    
    try:
        cursor.execute(
                '''
                select thought from thought where user_id=(%s)
                ''',(user_id,)
                
            )
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()
    