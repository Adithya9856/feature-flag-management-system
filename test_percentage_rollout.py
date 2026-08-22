import requests


API_URL = "http://127.0.0.1:8000/evaluate"

user_ids = range(200, 221)

results = []

for user_id in user_ids:
    response = requests.post(
        API_URL,
        json={
            "flag_key": "new_dashboard",
            "environment_name": "development",
            "user_context": {
                "user_id": str(user_id)
            },
        },
    )

    if response.status_code != 200:
        print(
            f"User {user_id}: "
            f"HTTP {response.status_code}"
        )
        continue

    data = response.json()

    results.append(data)

    print(
        f"User {user_id:>3} | "
        f"Enabled: {str(data.get('enabled')):<5} | "
        f"Reason: {data.get('reason', 'N/A')}"
    )


print("\nSummary")

percentage_matches = sum(
    1
    for result in results
    if result.get("reason") == "Matched percentage rollout"
)

default_results = sum(
    1
    for result in results
    if result.get("reason") != "Matched percentage rollout"
)

print(
    f"Total users tested: {len(results)}"
)

print(
    f"Percentage rollout matches: "
    f"{percentage_matches}"
)

print(
    f"Other results: "
    f"{default_results}"
)

if results:
    percentage = (
        percentage_matches /
        len(results)
    ) * 100

    print(
        f"Observed rollout percentage: "
        f"{percentage:.2f}%"
    )