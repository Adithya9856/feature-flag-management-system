from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.flag import Flag


class TargetingRule(Base):
    __tablename__ = "targeting_rules"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    flag_id: Mapped[int] = mapped_column(
        ForeignKey("flags.id", ondelete="CASCADE"),
        nullable=False,
    )

    rule_priority: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    attribute: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    operator: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    target_value: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    percentage: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    flag: Mapped["Flag"] = relationship(
        back_populates="targeting_rules",
    )