from datetime import datetime

from app.cache.redis_client import redis_client


def record_evaluation(
    flag_key: str,
    environment_name: str,
) -> None:
    """
    Increment the hourly evaluation counter for a feature flag.
    """

    current_hour = datetime.now().strftime("%Y-%m-%d-%H")

    cache_key = (
        f"evaluation:{environment_name}:"
        f"{flag_key}:{current_hour}"
    )

    redis_client.incr(cache_key)