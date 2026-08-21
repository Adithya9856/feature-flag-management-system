from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.flag_routes import router
from app.services.analytics_scheduler import scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the daily analytics scheduler
    scheduler.start()

    print("Analytics scheduler started.")

    yield

    # Stop the scheduler when the application shuts down
    scheduler.shutdown()

    print("Analytics scheduler stopped.")


app = FastAPI(
    title="Feature Flag Management System",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/")
def home():
    return {
        "message": "Feature flag management system running"
    }


app.include_router(router)