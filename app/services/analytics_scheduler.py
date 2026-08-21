from apscheduler.schedulers.background import BackgroundScheduler

from app.database.connection import SessionLocal
from app.services.analytics_flush_service import flush_evaluation_analytics


scheduler = BackgroundScheduler()


def run_daily_analytics_flush():
    db = SessionLocal()

    try:
        flushed_count = flush_evaluation_analytics(db)

        print(
            f"Daily analytics flush completed. "
            f"Flushed {flushed_count} Redis keys."
        )

    except Exception as error:
        print(f"Daily analytics flush failed: {error}")

    finally:
        db.close()


def start_scheduler():
    scheduler.add_job(
        run_daily_analytics_flush,
        "cron",
        hour=0,
        minute=0,
        id="daily_analytics_flush",
        replace_existing=True,
    )

    scheduler.start()


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()