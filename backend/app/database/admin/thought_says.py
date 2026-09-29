from ..connection import connect_db


def create_thoughtbook_says_thought(admin_thought,expires_at):
       connection = connect_db()
       cursor = connection.cursor()
       try:
           cursor.execute(
               '''
               insert into thoughtbook_says (admin_thought,expires_at)values(%s,%s)
               ''',(admin_thought,expires_at)
           )    
           connection.commit()
          
           return cursor.lastrowid
       finally:
           cursor.close()
           connection.close()
           
def get_thought_says_by_id(thought_id):
    connection = connect_db()
    cursor = connection.cursor()
    try:
        cursor.execute(
            '''
            select thought_id from thoughtbook_says where thought_id =%s
            ''',(thought_id,)
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        connection.close()
           
           
def get_current_thoughtbook_says_thought():
    connection = connect_db()
    cursor = connection.cursor()
    try:
         cursor.execute(
               '''
               select thought_id,
                       admin_thought,
                       published_at,
                       expires_at,
                       is_active
               from thoughtbook_says
               where is_active =TRUE
               and expires_at > NOW()
               order by published_at DESC
               limit 1
               '''
           )
            
         return cursor.fetchone()
    finally:
       cursor.close()
       connection.close()
       
       
def get_all_thoughtbook_says_thought():
    connection = connect_db()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                thought_id,
                admin_thought,
                published_at,
                expires_at,
                is_active
            FROM thoughtbook_says
            ORDER BY published_at DESC
            """
        )

        return cursor.fetchall()

    finally:
        cursor.close()
        connection.close()
        
def update_thoughtbook_says_thought(thought_id,admin_thought):
    connection = connect_db()
    cursor = connection.cursor()
    try:
        cursor.execute(
            '''
            update thoughtbook_says
            SET admin_thought = %s
            where thought_id = %s
            ''',(admin_thought,thought_id)       
        )
        connection.commit()
    finally:
        cursor.close()
        connection.close()
        
def delete_thoughtbook_says_thought(thought_id):
    connection = connect_db()
    cursor = connection.cursor()
    try:
        cursor.execute(
            '''
            DELETE from thoughtbook_says
            where thought_id=%s
            ''',(thought_id,)
            
        )
        connection.commit()
    finally:
        cursor.close()
        connection.close()