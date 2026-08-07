from app.database.connection import SessionLocal
from app.services.evaluation_engine import evaluate_flag


def test_default_value_fallback():
    db = SessionLocal()

    result = evaluate_flag(
        db=db,
        flag_key="payment_v2",
        environment_name="development",
        user_context=None,
    )

    assert result["success"] is True
    assert result["enabled"] is False
    assert result["value"] == "false"

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
        flag_key="new_dashboard",
        environment_name="production",
        user_context=None,
    )

    assert result["success"] is True
    assert result["environment"] == "production"

    db.close()


def test_empty_user_context():
    db = SessionLocal()

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_name="development",
        user_context={},
    )

    assert result["success"] is True

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


def test_percentage_rollout():
    db = SessionLocal()

    result = evaluate_flag(
        db=db,
        flag_key="new_dashboard",
        environment_name="development",
        user_context={
            "user_id": "103",
        },
    )

    assert result["success"] is True

    if "reason" in result:
        assert result["reason"] == "Matched percentage rollout"

    db.close()