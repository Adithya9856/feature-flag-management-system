from pydantic import BaseModel


class TargetingRuleCreate(BaseModel):
    flag_id: int
    rule_priority: int = 1
    attribute: str
    operator: str
    target_value: str
    percentage: int | None = None
    enabled: bool = True


class TargetingRuleUpdate(BaseModel):
    rule_priority: int
    attribute: str
    operator: str
    target_value: str
    percentage: int | None = None
    enabled: bool