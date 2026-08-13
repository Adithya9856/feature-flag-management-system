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


router = APIRouter()


# Flag APIs

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

    flag.flag_name = request.flag_name
    flag.description = request.description
    flag.flag_type = request.flag_type
    flag.default_value = request.default_value
    flag.enabled = request.enabled
    flag.owner_team = request.owner_team

    db.commit()
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

    db.delete(flag)
    db.commit()

    return {
        "message": "Flag deleted successfully"
    }


# Environment APIs

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


# Targeting Rule APIs

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

    rule.rule_priority = request.rule_priority
    rule.attribute = request.attribute
    rule.operator = request.operator
    rule.target_value = request.target_value
    rule.percentage = request.percentage
    rule.enabled = request.enabled

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

    db.delete(rule)
    db.commit()

    return {
        "message": "Targeting rule deleted successfully"
    }


# Flag Evaluation API

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