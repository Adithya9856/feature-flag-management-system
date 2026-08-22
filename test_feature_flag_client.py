from unittest.mock import patch

from app.middleware.feature_flag_client import FeatureFlagClient


client = FeatureFlagClient(
    api_url="http://127.0.0.1:8000",
    cache_ttl=60,
)


with patch("app.middleware.feature_flag_client.requests.post") as mock_post:

    mock_post.return_value.json.return_value = {
        "success": True,
        "environment": "development",
        "flag": "new_dashboard",
        "type": "boolean",
        "enabled": True,
        "value": "true",
        "reason": "Matched user targeting",
        "user_context": {
            "user_id": "101"
        },
    }

    mock_post.return_value.raise_for_status.return_value = None

    print("First evaluation:")

    result1 = client.evaluate(
        flag_key="new_dashboard",
        environment="development",
        user_context={"user_id": "101"},
    )

    print(result1)

    print(
        "API calls after first evaluation:",
        mock_post.call_count,
    )


    print("\nSecond evaluation:")

    result2 = client.evaluate(
        flag_key="new_dashboard",
        environment="development",
        user_context={"user_id": "101"},
    )

    print(result2)

    print(
        "API calls after second evaluation:",
        mock_post.call_count,
    )


    if mock_post.call_count == 1:
        print(
            "\nPASS: Second evaluation used "
            "the local cache."
        )
    else:
        print(
            "\nFAIL: Second evaluation "
            "called the API again."
        )