class BaseCRUD:
    def __init__(self, table_name: str):
        self.table_name = table_name

    def get_all(self, conn):
        cur = conn.cursor()
        # Safe because table_name is set by you in the code, not by the user
        cur.execute(f"SELECT * FROM {self.table_name};") 
        results = cur.fetchall()
        cur.close()
        return results

    def get_by_id(self, conn, record_id: int):
        cur = conn.cursor()
        # ALWAYS use %s for variables to prevent SQL Injection!
        cur.execute(f"SELECT * FROM {self.table_name} WHERE id = %s;", (record_id,))
        result = cur.fetchone()
        cur.close()
        return result

    def create(self, conn, data: dict):
        # data will be a dictionary like {"name": "React", "difficulty": "Beginner"}
        columns = ", ".join(data.keys())
        placeholders = ", ".join(["%s"] * len(data))
        values = tuple(data.values())

        query = f"INSERT INTO {self.table_name} ({columns}) VALUES ({placeholders}) RETURNING *;"
        
        cur = conn.cursor()
        cur.execute(query, values)
        new_record = cur.fetchone()
        conn.commit()  # IMPORTANT: Save the changes to the database!
        cur.close()
        return new_record

    def update(self, conn, record_id: int, data: dict):
        set_clause = ", ".join([f"{key} = %s" for key in data.keys()])
        values = tuple(data.values()) + (record_id,)

        query = f"UPDATE {self.table_name} SET {set_clause} WHERE id = %s RETURNING *;"
        
        cur = conn.cursor()
        cur.execute(query, values)
        updated_record = cur.fetchone()
        conn.commit()
        cur.close()
        return updated_record

    def delete(self, conn, record_id: int):
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {self.table_name} WHERE id = %s RETURNING id;", (record_id,))
        deleted_record = cur.fetchone()
        conn.commit()
        cur.close()
        return deleted_record