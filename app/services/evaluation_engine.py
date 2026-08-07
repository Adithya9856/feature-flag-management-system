from sqlalchemy.orm import Session

from app.models.environment import Environment
from app.models.flag import Flag
from app.models.targeting_rule import TargetingRule
from app.models.user_group_membership import UserGroupMembership
from app.services.rollout_services import is_user_in_rollout


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

    # User Targeting
    if user_context:
        user_id = str(user_context.get("user_id"))

        rule = (
            db.query(TargetingRule)
            .filter(
                TargetingRule.flag_id == flag.id,
                TargetingRule.attribute == "user_id",
                TargetingRule.operator == "=",
                TargetingRule.target_value == user_id,
                TargetingRule.enabled == True,
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

    # Group Targeting
    if user_context:
        user_id = str(user_context.get("user_id"))

        group = (
            db.query(UserGroupMembership)
            .filter(
                UserGroupMembership.user_id == user_id
            )
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
                    TargetingRule.enabled == True,
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

    # Percentage Rollout
    if user_context:
        user_id = str(user_context.get("user_id"))

        percentage_rule = (
            db.query(TargetingRule)
            .filter(
                TargetingRule.flag_id == flag.id,
                TargetingRule.attribute == "percentage",
                TargetingRule.enabled == True,
            )
            .first()
        )

        if percentage_rule:
            if is_user_in_rollout(
                user_id=user_id,
                flag_key=flag.flag_key,
                rollout_percentage=percentage_rule.percentage,
            ):
                return {
                    "success": True,
                    "environment": environment.name,
                    "flag": flag.flag_key,
                    "type": flag.flag_type,
                    "enabled": True,
                    "value": flag.default_value,
                    "reason": "Matched percentage rollout",
                    "user_context": user_context,
                }

    # Default Evaluation
    return {
        "success": True,
        "environment": environment.name,
        "flag": flag.flag_key,
        "type": flag.flag_type,
        "enabled": flag.enabled,
        "value": flag.default_value,
        "user_context": user_context,
    }