from __future__ import annotations
from datetime import UTC, datetime

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class AuditLog(Base):
    """Stores audit events."""

    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    actor: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    action: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    table_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    record_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    previous_data: Mapped[str | None] = mapped_column(
        String(2000),
        nullable=True,
    )

    new_data: Mapped[str | None] = mapped_column(
        String(2000),
        nullable=True,
    )

    timestamp: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(UTC)
    )