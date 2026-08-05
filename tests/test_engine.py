from app.database.connection import SessionLocal
from app.services.evaluation_engine import evaluate_flag


def test_default_value_fallback():
    db = SessionLocal()

    result = evaluate_flag(
        db=db,
        flag_key="dark_mode",
        environment_name="development",
    )

    assert result["success"] is True
    assert result["value"] == "true"

    db.close()


def test_disabled_flag():
    db = SessionLocal()

    result = evaluate_flag(
        db=db,
        flag_key="payment_v2",
        environment_name="development",
    )

    assert result["success"] is True
    assert result["enabled"] is False

    db.close()


def test_environment_override():
    db = SessionLocal()

    result = evaluate_flag(
        db=db,
        flag_key="dark_mode",
        environment_name="production",
    )

    assert result["success"] is True
    assert result["environment"] == "production"
    assert result["enabled"] is False

    db.close()


def test_empty_user_context():
    db = SessionLocal()

    result = evaluate_flag(
        db=db,
        flag_key="dark_mode",
        environment_name="production",
        user_context={},
    )

    assert result["success"] is True
    assert result["environment"] == "production"
    assert result["user_context"] == {}

    db.close()


def test_user_targeting():
    db = SessionLocal()

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_name="development",
        user_context={
            "user_id": "101",
        },
    )

    assert result["success"] is True
    assert result["reason"] == "Matched user targeting"

    db.close()


def test_group_targeting():
    db = SessionLocal()

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_name="development",
        user_context={
            "user_id": "102",
        },
    )

    assert result["success"] is True
    assert result["reason"] == "Matched group targeting"

    db.close()