from sqlalchemy.orm import Session

from app.models.environment import Environment
from app.models.flag import Flag
from app.models.targeting_rule import TargetingRule
from app.models.user_group_membership import UserGroupMembership


def evaluate_flag(
    db: Session,
    flag_key: str,
    environment_name: str,
    user_context: dict | None = None,
):
    # Find the environment
    environment = (
        db.query(Environment)
        .filter(Environment.name == environment_name)
        .first()
    )

    if environment is None:
        return {
            "success": False,
            "message": "Environment not found",
        }

    # Find the flag in that environment
    flag = (
        db.query(Flag)
        .filter(
            Flag.environment_id == environment.id,
            Flag.flag_key == flag_key,
        )
        .first()
    )

    if flag is None:
        return {
            "success": False,
            "message": "Flag not found",
        }

    # Check user targeting
    if user_context:
        user_id = str(user_context.get("user_id"))

        rule = (
            db.query(TargetingRule)
            .filter(
                TargetingRule.flag_id == flag.id,
                TargetingRule.attribute == "user_id",
                TargetingRule.operator == "=",
                TargetingRule.target_value == user_id,
                TargetingRule.enabled.is_(True),
            )
            .first()
        )

        if rule:
            return {
                "success": True,
                "environment": environment.name,
                "flag": flag.flag_key,
                "type": flag.flag_type,
                "enabled": True,
                "value": flag.default_value,
                "reason": "Matched user targeting",
                "user_context": user_context,
            }

        # Check group targeting
        group = (
            db.query(UserGroupMembership)
            .filter(UserGroupMembership.user_id == user_id)
            .first()
        )

        if group:
            group_rule = (
                db.query(TargetingRule)
                .filter(
                    TargetingRule.flag_id == flag.id,
                    TargetingRule.attribute == "group_name",
                    TargetingRule.operator == "=",
                    TargetingRule.target_value == group.group_name,
                    TargetingRule.enabled.is_(True),
                )
                .first()
            )

            if group_rule:
                return {
                    "success": True,
                    "environment": environment.name,
                    "flag": flag.flag_key,
                    "type": flag.flag_type,
                    "enabled": True,
                    "value": flag.default_value,
                    "reason": "Matched group targeting",
                    "user_context": user_context,
                }

    # Return default flag evaluation
    return {
        "success": True,
        "environment": environment.name,
        "flag": flag.flag_key,
        "type": flag.flag_type,
        "enabled": flag.enabled,
        "value": flag.default_value,
        "user_context": user_context,
    }