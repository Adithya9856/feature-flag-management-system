from app.database.connection import SessionLocal
from app.services.evaluation_engine import evaluate_flag


def test_evaluate_flag():
    db = SessionLocal()

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_name="production",
        user_context={
            "user_id": 101,
            "groups": ["admin"],
            "country": "India",
        },
    )

    print(result)

    assert result["success"] is True
    assert result["environment"] == "production"
    assert result["flag"] == "new_dashboard"
    assert result["type"] == "boolean"
    assert result["enabled"] is False
    assert result["value"] == "false"

    assert result["user_context"]["user_id"] == 101
    assert result["user_context"]["groups"] == ["admin"]
    assert result["user_context"]["country"] == "India"

    db.close()