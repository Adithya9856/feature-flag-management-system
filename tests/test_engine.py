from app.database.connection import SessionLocal
from app.services.evaluation_engine import evaluate_flag


def test_evaluate_flag():
    db = SessionLocal()

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_name="development",
    )

    print(result)

    assert result["success"] is True
    assert result["enabled"] is True
    assert result["flag"] == "new_dashboard"
    assert result["value"] == "true"

    db.close()