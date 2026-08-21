from app.middleware.feature_flag_client import FeatureFlagClient


client = FeatureFlagClient(
    api_url="http://127.0.0.1:8000",
    cache_ttl=60,
)


print("First evaluation:")
result1 = client.evaluate(
    flag_key="new_dashboard",
    environment="development",
    user_context={"user_id": "101"},
)
print(result1)


print("\nSecond evaluation:")
result2 = client.evaluate(
    flag_key="new_dashboard",
    environment="development",
    user_context={"user_id": "101"},
)
print(result2)