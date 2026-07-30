from sqlalchemy.orm import Session

from app.models.environment import Environment
from app.models.flag import Flag


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

    return {
        "success": True,
        "environment": environment.name,
        "flag": flag.flag_key,
        "type": flag.flag_type,
        "enabled": flag.enabled,
        "value": flag.default_value,
        "user_context": user_context,
    }