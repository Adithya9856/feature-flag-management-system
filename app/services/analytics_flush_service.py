from datetime import datetime

from sqlalchemy.orm import Session

from app.cache.redis_client import redis_client
from app.models.evaluation_analytics import EvaluationAnalytics


def flush_evaluation_analytics(db: Session):
    # Find all evaluation analytics keys in Redis
    keys = redis_client.keys("evaluation:*")

    flushed_count = 0

    for key in keys:
        if isinstance(key, bytes):
            key = key.decode("utf-8")

        parts = key.split(":")

        if len(parts) != 4:
            continue

        _, environment_name, flag_key, hour_string = parts

        count = redis_client.get(key)

        if count is None:
            continue

        if isinstance(count, bytes):
            count = count.decode("utf-8")

        evaluation_count = int(count)

        evaluation_hour = datetime.strptime(
            hour_string,
            "%Y-%m-%d-%H",
        )

        existing_record = (
            db.query(EvaluationAnalytics)
            .filter(
                EvaluationAnalytics.flag_key == flag_key,
                EvaluationAnalytics.environment_name == environment_name,
                EvaluationAnalytics.evaluation_hour == evaluation_hour,
            )
            .first()
        )

        if existing_record:
            existing_record.evaluation_count += evaluation_count
        else:
            analytics = EvaluationAnalytics(
                flag_key=flag_key,
                environment_name=environment_name,
                evaluation_hour=evaluation_hour,
                evaluation_count=evaluation_count,
            )

            db.add(analytics)

        db.commit()

        # Delete the Redis counter after successful database storage
        redis_client.delete(key)

        flushed_count += 1

    return flushed_count