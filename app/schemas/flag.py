from pydantic import BaseModel


class FlagCreate(BaseModel):
    environment_id: int
    flag_key: str
    flag_name: str
    description: str | None = None
    flag_type: str = "boolean"
    default_value: str = "false"
    enabled: bool = True
    owner_team: str | None = None


class FlagUpdate(BaseModel):
    flag_name: str
    description: str | None = None
    flag_type: str
    default_value: str
    enabled: bool
    owner_team: str | None = None