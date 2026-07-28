from fastapi import FastAPI
from sqlalchemy import text

from app.database.connection import engine

app = FastAPI(
    title="Feature Flag Management System",
    version="1.0.0"
)


@app.get("/")
def home():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "message": "Welcome to the Feature Flag Management System",
            "database": "Connected successfully"
        }

    except Exception as e:
        return {
            "message": "Database connection failed",
            "error": str(e)
        }