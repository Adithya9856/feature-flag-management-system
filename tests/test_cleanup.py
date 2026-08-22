from datetime import UTC, datetime, timedelta
from app.models.targeting_rule import TargetingRule
from app.database.connection import SessionLocal
from app.models.environment import Environment
from app.models.flag import Flag
from app.services.flag_cleanup_service import (
    find_cleanup_candidates,
)


def test_fully_disabled_across_all_environments():
    db = SessionLocal()

    flag_key = "test_cleanup_all_disabled"

    try:
        environments = (
            db.query(Environment)
            .filter(
                Environment.name.in_(
                    [
                        "development",
                        "staging",
                        "production",
                    ]
                )
            )
            .all()
        )

        assert len(environments) == 3

        old_date = (
            datetime.now(UTC)
            - timedelta(days=31)
        )

        for environment in environments:
            flag = Flag(
                environment_id=environment.id,
                flag_key=flag_key,
                flag_name="Test Cleanup All Disabled",
                flag_type="boolean",
                default_value="false",
                enabled=False,
                updated_at=old_date,
            )

            db.add(flag)

        db.commit()

        candidates = find_cleanup_candidates(
            db=db,
            days=30,
        )

        matching = [
            candidate
            for candidate in candidates
            if candidate["flag_key"] == flag_key
        ]

        assert len(matching) == 1

        assert (
            matching[0]["reason"]
            == "Fully disabled across all environments"
        )

    finally:
        db.query(Flag).filter(
            Flag.flag_key == flag_key
        ).delete(
            synchronize_session=False
        )

        db.commit()
        db.close()


def test_not_candidate_when_one_environment_enabled():
    db = SessionLocal()

    flag_key = "test_cleanup_partial"

    try:
        environments = (
            db.query(Environment)
            .filter(
                Environment.name.in_(
                    [
                        "development",
                        "staging",
                        "production",
                    ]
                )
            )
            .all()
        )

        assert len(environments) == 3

        old_date = (
            datetime.now(UTC)
            - timedelta(days=31)
        )

        for index, environment in enumerate(
            environments
        ):
            flag = Flag(
                environment_id=environment.id,
                flag_key=flag_key,
                flag_name="Test Cleanup Partial",
                flag_type="boolean",
                default_value="false",
                enabled=(index == 0),
                updated_at=old_date,
            )

            db.add(flag)

        db.commit()

        candidates = find_cleanup_candidates(
            db=db,
            days=30,
        )

        matching = [
            candidate
            for candidate in candidates
            if candidate["flag_key"] == flag_key
        ]

        assert len(matching) == 0

    finally:
        db.query(Flag).filter(
            Flag.flag_key == flag_key
        ).delete(
            synchronize_session=False
        )

        db.commit()
        db.close()
def test_fully_rolled_out_across_all_environments():
    db = SessionLocal()

    flag_key = "test_cleanup_100_percent"

    try:
        environments = (
            db.query(Environment)
            .filter(
                Environment.name.in_(
                    [
                        "development",
                        "staging",
                        "production",
                    ]
                )
            )
            .all()
        )

        assert len(environments) == 3

        old_date = (
            datetime.now(UTC)
            - timedelta(days=31)
        )

        for environment in environments:
            flag = Flag(
                environment_id=environment.id,
                flag_key=flag_key,
                flag_name="Test Cleanup 100 Percent",
                flag_type="boolean",
                default_value="false",
                enabled=True,
                updated_at=old_date,
            )

            db.add(flag)

        db.flush()

        created_flags = (
            db.query(Flag)
            .filter(
                Flag.flag_key == flag_key
            )
            .all()
        )

        for flag in created_flags:
            db.add(
                TargetingRule(
                    flag_id=flag.id,
                    rule_priority=1,
                    attribute="percentage",
                    operator="=",
                    target_value="100",
                    percentage=100,
                    enabled=True,
                )
            )

        db.commit()

        candidates = find_cleanup_candidates(
            db=db,
            days=30,
        )

        matching = [
            candidate
            for candidate in candidates
            if candidate["flag_key"] == flag_key
        ]

        assert len(matching) == 1

        assert (
            matching[0]["reason"]
            == "100% percentage rollout across all environments"
        )

    finally:
        db.query(TargetingRule).filter(
            TargetingRule.flag_id.in_(
                db.query(Flag.id).filter(
                    Flag.flag_key == flag_key
                )
            )
        ).delete(
            synchronize_session=False
        )

        db.query(Flag).filter(
            Flag.flag_key == flag_key
        ).delete(
            synchronize_session=False
        )

        db.commit()
        db.close()