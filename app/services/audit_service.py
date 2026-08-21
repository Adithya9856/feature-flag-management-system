import json

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    actor: str,
    action: str,
    table_name: str,
    record_id: str | None = None,
    previous_data: dict | None = None,
    new_data: dict | None = None,
):
    audit_log = AuditLog(
        actor=actor,
        action=action,
        table_name=table_name,
        record_id=record_id,
        previous_data=(
            json.dumps(previous_data)
            if previous_data is not None
            else None
        ),
        new_data=(
            json.dumps(new_data)
            if new_data is not None
            else None
        ),
    )

    db.add(audit_log)

    return audit_log