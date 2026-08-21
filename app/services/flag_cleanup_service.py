from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.models.flag import Flag
from app.models.targeting_rule import TargetingRule


def find_cleanup_candidates(
    db: Session,
    days: int = 30,
):
    cutoff_date = datetime.now(UTC) - timedelta(days=days)

    flags = db.query(Flag).all()

    candidates = []

    for flag in flags:
        updated_at = flag.updated_at

        if updated_at is None:
            continue

        # Make the comparison timezone-aware when necessary
        if updated_at.tzinfo is None:
            updated_at = updated_at.replace(tzinfo=UTC)

        if updated_at > cutoff_date:
            continue

        reason = None

        # Check whether the flag is fully disabled
        if flag.enabled is False:
            reason = "Fully disabled"

        # Check whether the flag has a 100% percentage rollout
        if reason is None:
            rollout_rule = (
                db.query(TargetingRule)
                .filter(
                    TargetingRule.flag_id == flag.id,
                    TargetingRule.attribute == "percentage",
                    TargetingRule.percentage == 100,
                    TargetingRule.enabled == True,
                )
                .first()
            )

            if rollout_rule:
                reason = "100% percentage rollout"

        if reason:
            candidates.append(
                {
                    "flag_id": flag.id,
                    "flag_key": flag.flag_key,
                    "environment_id": flag.environment_id,
                    "reason": reason,
                    "updated_at": flag.updated_at,
                    "days_since_update": (
                        datetime.now(UTC) - updated_at
                    ).days,
                }
            )

    return candidates
