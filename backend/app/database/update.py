from .connection import connect_db



def update_dp(user_id,dp_url):
    connection = connect_db()
    cursor = connection.cursor()
    
    try:
        cursor.execute(
                '''
                update user_log_details set user_profile_pic=%s where user_id =%s
                ''',(dp_url,user_id)
                
            )
            
        connection.commit()
    finally:
        cursor.close()
        connection.close()   
        
        
def update_cover(user_id,cover_url):
    connection = connect_db()
    cursor = connection.cursor()
    try:
        cursor.execute(
            '''
            update user_log_details set user_cover_pic =%s where user_id=%s
            ''',(cover_url,user_id)  
        )
        connection.commit()
    finally:
        cursor.close()
        connection.close()
    