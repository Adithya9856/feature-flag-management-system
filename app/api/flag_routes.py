from app.services.audit_service import create_audit_log
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.models.flag import Flag
from app.models.environment import Environment
from app.models.targeting_rule import TargetingRule

from app.schemas.flag import FlagCreate, FlagUpdate
from app.schemas.environment import EnvironmentCreate, EnvironmentUpdate
from app.schemas.targeting_rule import (
    TargetingRuleCreate,
    TargetingRuleUpdate,
)
from app.schemas.evaluation import EvaluationRequest

from app.services.evaluation_engine import evaluate_flag

# Redis
from app.cache.redis_client import redis_client
from app.services.flag_cleanup_service import find_cleanup_candidates

router = APIRouter()


# ============================================================
# FLAG APIs
# ============================================================

# Get all flags
@router.get("/flags")
def get_all_flags(
    db: Session = Depends(get_db),
):
    return db.query(Flag).all()


# Create a flag
@router.post("/flags")
def create_flag(
    request: FlagCreate,
    db: Session = Depends(get_db),
):
    flag = Flag(
        environment_id=request.environment_id,
        flag_key=request.flag_key,
        flag_name=request.flag_name,
        description=request.description,
        flag_type=request.flag_type,
        default_value=request.default_value,
        enabled=request.enabled,
        owner_team=request.owner_team,
    )

    db.add(flag)
    db.flush()

    environment = (
        db.query(Environment)
        .filter(Environment.id == flag.environment_id)
        .first()
    )

    new_data = {
        "environment": environment.name if environment else None,
        "flag_key": flag.flag_key,
        "flag_name": flag.flag_name,
        "description": flag.description,
        "flag_type": flag.flag_type,
        "default_value": flag.default_value,
        "enabled": flag.enabled,
        "owner_team": flag.owner_team,
    }

    create_audit_log(
        db=db,
        actor="system",
        action="CREATE",
        table_name="flags",
        record_id=str(flag.id),
        previous_data=None,
        new_data=new_data,
    )

    db.commit()
    db.refresh(flag)

    return flag

# Get a flag by ID
@router.get("/flags/{flag_id}")
def get_flag(
    flag_id: int,
    db: Session = Depends(get_db),
):
    flag = (
        db.query(Flag)
        .filter(Flag.id == flag_id)
        .first()
    )

    if flag is None:
        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    return flag


# Update a flag
@router.put("/flags/{flag_id}")
def update_flag(
    flag_id: int,
    request: FlagUpdate,
    db: Session = Depends(get_db),
):
    flag = (
        db.query(Flag)
        .filter(Flag.id == flag_id)
        .first()
    )

    if flag is None:
        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    environment = (
        db.query(Environment)
        .filter(Environment.id == flag.environment_id)
        .first()
    )

    previous_data = {
        "environment": environment.name if environment else None,
        "flag_key": flag.flag_key,
        "flag_name": flag.flag_name,
        "description": flag.description,
        "flag_type": flag.flag_type,
        "default_value": flag.default_value,
        "enabled": flag.enabled,
        "owner_team": flag.owner_team,
    }

    old_enabled = flag.enabled

    # Update flag
    flag.flag_name = request.flag_name
    flag.description = request.description
    flag.flag_type = request.flag_type
    flag.default_value = request.default_value
    flag.enabled = request.enabled
    flag.owner_team = request.owner_team

    new_data = {
        "environment": environment.name if environment else None,
        "flag_key": flag.flag_key,
        "flag_name": flag.flag_name,
        "description": flag.description,
        "flag_type": flag.flag_type,
        "default_value": flag.default_value,
        "enabled": flag.enabled,
        "owner_team": flag.owner_team,
    }

    # Detect enable or disable
    if old_enabled is False and flag.enabled is True:
        action = "ENABLE"
    elif old_enabled is True and flag.enabled is False:
        action = "DISABLE"
    else:
        action = "UPDATE"

    create_audit_log(
        db=db,
        actor="system",
        action=action,
        table_name="flags",
        record_id=str(flag.id),
        previous_data=previous_data,
        new_data=new_data,
    )

    db.commit()

    # Invalidate Redis cache
    cache_key = f"{environment.name}:{flag.flag_key}"
    redis_client.delete(cache_key)

    db.refresh(flag)

    return flag


# Delete a flag
@router.delete("/flags/{flag_id}")
def delete_flag(
    flag_id: int,
    db: Session = Depends(get_db),
):
    flag = (
        db.query(Flag)
        .filter(Flag.id == flag_id)
        .first()
    )

    if flag is None:
        raise HTTPException(
            status_code=404,
            detail="Flag not found",
        )

    # --------------------------------------------------------
    # Save cache key before deleting the database object
    # --------------------------------------------------------
    cache_key = f"{flag.environment.name}:{flag.flag_key}"

    # Delete flag from PostgreSQL
    db.delete(flag)
    db.commit()

    # --------------------------------------------------------
    # Redis Cache Invalidation
    # --------------------------------------------------------
    redis_client.delete(cache_key)

    return {
        "message": "Flag deleted successfully"
    }


# ============================================================
# ENVIRONMENT APIs
# ============================================================

# Get all environments
@router.get("/environments")
def get_all_environments(
    db: Session = Depends(get_db),
):
    return db.query(Environment).all()


# Create an environment
@router.post("/environments")
def create_environment(
    request: EnvironmentCreate,
    db: Session = Depends(get_db),
):
    environment = Environment(
        name=request.name,
    )

    db.add(environment)
    db.commit()
    db.refresh(environment)

    return environment


# Get an environment by ID
@router.get("/environments/{environment_id}")
def get_environment(
    environment_id: int,
    db: Session = Depends(get_db),
):
    environment = (
        db.query(Environment)
        .filter(Environment.id == environment_id)
        .first()
    )

    if environment is None:
        raise HTTPException(
            status_code=404,
            detail="Environment not found",
        )

    return environment


# Update an environment
@router.put("/environments/{environment_id}")
def update_environment(
    environment_id: int,
    request: EnvironmentUpdate,
    db: Session = Depends(get_db),
):
    environment = (
        db.query(Environment)
        .filter(Environment.id == environment_id)
        .first()
    )

    if environment is None:
        raise HTTPException(
            status_code=404,
            detail="Environment not found",
        )

    environment.name = request.name

    db.commit()
    db.refresh(environment)

    return environment


# Delete an environment
@router.delete("/environments/{environment_id}")
def delete_environment(
    environment_id: int,
    db: Session = Depends(get_db),
):
    environment = (
        db.query(Environment)
        .filter(Environment.id == environment_id)
        .first()
    )

    if environment is None:
        raise HTTPException(
            status_code=404,
            detail="Environment not found",
        )

    db.delete(environment)
    db.commit()

    return {
        "message": "Environment deleted successfully"
    }
# ============================================================
# TARGETING RULE APIs
# ============================================================

# Get all targeting rules
@router.get("/targeting-rules")
def get_all_targeting_rules(
    db: Session = Depends(get_db),
):
    return db.query(TargetingRule).all()


# Create a targeting rule
@router.post("/targeting-rules")
def create_targeting_rule(
    request: TargetingRuleCreate,
    db: Session = Depends(get_db),
):
    rule = TargetingRule(
        flag_id=request.flag_id,
        rule_priority=request.rule_priority,
        attribute=request.attribute,
        operator=request.operator,
        target_value=request.target_value,
        percentage=request.percentage,
        enabled=request.enabled,
    )

    db.add(rule)
    db.flush()

    # Find the flag and environment
    flag = (
        db.query(Flag)
        .filter(Flag.id == rule.flag_id)
        .first()
    )

    environment = None

    if flag:
        environment = (
            db.query(Environment)
            .filter(Environment.id == flag.environment_id)
            .first()
        )

    new_data = {
        "environment": environment.name if environment else None,
        "flag_id": rule.flag_id,
        "rule_priority": rule.rule_priority,
        "attribute": rule.attribute,
        "operator": rule.operator,
        "target_value": rule.target_value,
        "percentage": rule.percentage,
        "enabled": rule.enabled,
    }

    # Create audit log
    create_audit_log(
        db=db,
        actor="system",
        action="CREATE",
        table_name="targeting_rules",
        record_id=str(rule.id),
        previous_data=None,
        new_data=new_data,
    )

    db.commit()
    db.refresh(rule)

    return rule


# Get a targeting rule by ID
@router.get("/targeting-rules/{rule_id}")
def get_targeting_rule(
    rule_id: int,
    db: Session = Depends(get_db),
):
    rule = (
        db.query(TargetingRule)
        .filter(TargetingRule.id == rule_id)
        .first()
    )

    if rule is None:
        raise HTTPException(
            status_code=404,
            detail="Targeting rule not found",
        )

    return rule


# Update a targeting rule
@router.put("/targeting-rules/{rule_id}")
def update_targeting_rule(
    rule_id: int,
    request: TargetingRuleUpdate,
    db: Session = Depends(get_db),
):
    rule = (
        db.query(TargetingRule)
        .filter(TargetingRule.id == rule_id)
        .first()
    )

    if rule is None:
        raise HTTPException(
            status_code=404,
            detail="Targeting rule not found",
        )

    # Find the flag and environment
    flag = (
        db.query(Flag)
        .filter(Flag.id == rule.flag_id)
        .first()
    )

    environment = None

    if flag:
        environment = (
            db.query(Environment)
            .filter(Environment.id == flag.environment_id)
            .first()
        )

    # Save previous state
    previous_data = {
        "environment": environment.name if environment else None,
        "flag_id": rule.flag_id,
        "rule_priority": rule.rule_priority,
        "attribute": rule.attribute,
        "operator": rule.operator,
        "target_value": rule.target_value,
        "percentage": rule.percentage,
        "enabled": rule.enabled,
    }

    # Update targeting rule
    rule.rule_priority = request.rule_priority
    rule.attribute = request.attribute
    rule.operator = request.operator
    rule.target_value = request.target_value
    rule.percentage = request.percentage
    rule.enabled = request.enabled

    # Save new state
    new_data = {
        "environment": environment.name if environment else None,
        "flag_id": rule.flag_id,
        "rule_priority": rule.rule_priority,
        "attribute": rule.attribute,
        "operator": rule.operator,
        "target_value": rule.target_value,
        "percentage": rule.percentage,
        "enabled": rule.enabled,
    }

    # Create audit log
    create_audit_log(
        db=db,
        actor="system",
        action="UPDATE",
        table_name="targeting_rules",
        record_id=str(rule.id),
        previous_data=previous_data,
        new_data=new_data,
    )

    db.commit()
    db.refresh(rule)

    return rule


# Delete a targeting rule
@router.delete("/targeting-rules/{rule_id}")
def delete_targeting_rule(
    rule_id: int,
    db: Session = Depends(get_db),
):
    rule = (
        db.query(TargetingRule)
        .filter(TargetingRule.id == rule_id)
        .first()
    )

    if rule is None:
        raise HTTPException(
            status_code=404,
            detail="Targeting rule not found",
        )

    # Find the flag and environment
    flag = (
        db.query(Flag)
        .filter(Flag.id == rule.flag_id)
        .first()
    )

    environment = None

    if flag:
        environment = (
            db.query(Environment)
            .filter(Environment.id == flag.environment_id)
            .first()
        )

    # Save state before deletion
    previous_data = {
        "environment": environment.name if environment else None,
        "flag_id": rule.flag_id,
        "rule_priority": rule.rule_priority,
        "attribute": rule.attribute,
        "operator": rule.operator,
        "target_value": rule.target_value,
        "percentage": rule.percentage,
        "enabled": rule.enabled,
    }

    # Create audit log before deleting the rule
    create_audit_log(
        db=db,
        actor="system",
        action="DELETE",
        table_name="targeting_rules",
        record_id=str(rule.id),
        previous_data=previous_data,
        new_data=None,
    )

    db.delete(rule)
    db.commit()

    return {
        "message": "Targeting rule deleted successfully"
    }
# ============================================================
# FLAG EVALUATION API
# ============================================================

# Evaluate a feature flag
@router.post("/evaluate")
def evaluate(
    request: EvaluationRequest,
    db: Session = Depends(get_db),
):
    return evaluate_flag(
        db=db,
        flag_key=request.flag_key,
        environment_name=request.environment_name,
        user_context=request.user_context,
    )
@router.get("/cleanup/flags")
def get_cleanup_candidates(
    days: int = 30,
    db: Session = Depends(get_db),
):
    if days < 1:
        raise HTTPException(
            status_code=400,
            detail="days must be at least 1",
        )

    return {
        "days": days,
        "candidates": find_cleanup_candidates(
            db=db,
            days=days,
        ),
    }
    