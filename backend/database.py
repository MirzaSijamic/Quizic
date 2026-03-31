# database.py
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import HTTPException

DB_URL = "postgresql://postgres:M1k12026!$!@localhost:5432/postgres"


def get_db_connection():
    conn = None
    try:
        conn = psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        yield conn  # "yield" hands the connection to the router, and pauses here
    finally:
        if conn is not None:
            conn.close()  # This runs automatically after the router is done!