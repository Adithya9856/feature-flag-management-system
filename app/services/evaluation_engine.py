from sqlalchemy.orm import Session

from app.models.environment import Environment
from app.models.flag import Flag


def evaluate_flag(
    db: Session,
    flag_key: str,
    environment_name: str,
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

    if flag.enabled:
        return {
            "success": True,
            "flag": flag.flag_key,
            "enabled": True,
            "value": flag.default_value,
        }

    return {
        "success": True,
        "flag": flag.flag_key,
        "enabled": False,
        "value": None,
    }