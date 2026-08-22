from collections import defaultdict
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.models.environment import Environment
from app.models.flag import Flag
from app.models.targeting_rule import TargetingRule


def find_cleanup_candidates(
    db: Session,
    days: int = 30,
):
    cutoff_date = datetime.now(UTC) - timedelta(days=days)

    environments = (
        db.query(Environment)
        .order_by(Environment.id)
        .all()
    )

    flags = (
        db.query(Flag)
        .order_by(Flag.flag_key, Flag.environment_id)
        .all()
    )

    # Group flag records by flag_key.
    flags_by_key = defaultdict(list)

    for flag in flags:
        flags_by_key[flag.flag_key].append(flag)

    candidates = []

    for flag_key, environment_flags in flags_by_key.items():

        # A flag must exist in every environment.
        if len(environment_flags) != len(environments):
            continue

        environment_ids = {
            flag.environment_id
            for flag in environment_flags
        }

        all_environments_present = all(
            environment.id in environment_ids
            for environment in environments
        )

        if not all_environments_present:
            continue

        # Normalize timestamps.
        normalized_flags = []

        for flag in environment_flags:
            updated_at = flag.updated_at

            if updated_at is None:
                break

            if updated_at.tzinfo is None:
                updated_at = updated_at.replace(
                    tzinfo=UTC
                )

            normalized_flags.append(
                (flag, updated_at)
            )

        if len(normalized_flags) != len(
            environment_flags
        ):
            continue

        # Every environment must have been unchanged
        # for at least N days.
        if any(
            updated_at > cutoff_date
            for _, updated_at in normalized_flags
        ):
            continue

        # -------------------------------------------------
        # Check 1: Fully disabled across all environments
        # -------------------------------------------------

        all_disabled = all(
            flag.enabled is False
            for flag, _ in normalized_flags
        )

        if all_disabled:
            oldest_update = min(
                updated_at
                for _, updated_at in normalized_flags
            )

            candidates.append(
                {
                    "flag_key": flag_key,
                    "reason": (
                        "Fully disabled across all "
                        "environments"
                    ),
                    "environment_count": len(
                        environments
                    ),
                    "updated_at": oldest_update,
                    "days_since_update": (
                        datetime.now(UTC)
                        - oldest_update
                    ).days,
                }
            )

            continue

        # -------------------------------------------------
        # Check 2: 100% rollout across all environments
        # -------------------------------------------------

        all_fully_rolled_out = True

        for flag, _ in normalized_flags:

            rollout_rule = (
                db.query(TargetingRule)
                .filter(
                    TargetingRule.flag_id == flag.id,
                    TargetingRule.attribute
                    == "percentage",
                    TargetingRule.percentage == 100,
                    TargetingRule.enabled == True,
                )
                .first()
            )

            if rollout_rule is None:
                all_fully_rolled_out = False
                break

        if all_fully_rolled_out:
            oldest_update = min(
                updated_at
                for _, updated_at in normalized_flags
            )

            candidates.append(
                {
                    "flag_key": flag_key,
                    "reason": (
                        "100% percentage rollout "
                        "across all environments"
                    ),
                    "environment_count": len(
                        environments
                    ),
                    "updated_at": oldest_update,
                    "days_since_update": (
                        datetime.now(UTC)
                        - oldest_update
                    ).days,
                }
            )

    return candidates