from app.database.connection import SessionLocal
from app.services.evaluation_engine import evaluate_flag


def test_default_value_fallback():
    db = SessionLocal()

    result = evaluate_flag(
        db=db,
        flag_key="dark_mode",
        environment_name="development",
        user_context=None,
    )

    assert result["success"] is True
    assert result["value"] == "true"  # Assuming the default value for dark_mode is "true"

    db.close()


def test_disabled_flag():
    db = SessionLocal()

    result = evaluate_flag(
        db=db,
        flag_key="payment_v2",
        environment_name="development",
        user_context=None,
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
        user_context=None,
    )

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

    assert result["environment"] == "production"
    assert result["enabled"] is False
    assert result["user_context"] == {}

    db.close()