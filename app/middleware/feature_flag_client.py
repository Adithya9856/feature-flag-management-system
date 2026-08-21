import time

import requests


class FeatureFlagClient:
    """Client for querying feature flags with local caching."""

    def __init__(
        self,
        api_url: str,
        cache_ttl: int = 60,
    ):
        self.api_url = api_url.rstrip("/")
        self.cache_ttl = cache_ttl
        self._cache = {}

    def _create_cache_key(
        self,
        flag_key: str,
        environment: str,
        user_context: dict | None,
    ) -> str:
        user_id = None

        if user_context:
            user_id = user_context.get("user_id")

        return (
            f"{environment}:"
            f"{flag_key}:"
            f"{user_id}"
        )

    def evaluate(
        self,
        flag_key: str,
        environment: str,
        user_context: dict | None = None,
    ):
        cache_key = self._create_cache_key(
            flag_key=flag_key,
            environment=environment,
            user_context=user_context,
        )

        # Check local cache
        cached_item = self._cache.get(cache_key)

        if cached_item:
            cached_result, cached_time = cached_item

            if time.time() - cached_time < self.cache_ttl:
                return cached_result

            # Remove expired cache entry
            del self._cache[cache_key]

        # Query the feature flag API
        response = requests.post(
            f"{self.api_url}/evaluate",
            json={
                "flag_key": flag_key,
                "environment_name": environment,
                "user_context": user_context,
            },
            timeout=5,
        )

        response.raise_for_status()

        result = response.json()

        # Store the result in local cache
        self._cache[cache_key] = (
            result,
            time.time(),
        )

        return result

    def clear_cache(self):
        """Clear all locally cached feature flag results."""
        self._cache.clear()

    def remove_from_cache(
        self,
        flag_key: str,
        environment: str,
        user_context: dict | None = None,
    ):
        """Remove one feature flag result from local cache."""

        cache_key = self._create_cache_key(
            flag_key=flag_key,
            environment=environment,
            user_context=user_context,
        )

        self._cache.pop(cache_key, None)