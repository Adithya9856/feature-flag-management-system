from __future__ import annotations
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.environment import Environment
    from app.models.flag_version import FlagVersion
    from app.models.targeting_rule import TargetingRule


class Flag(Base):
    """Represents a feature flag."""

    __tablename__ = "flags"

    __table_args__ = (
        UniqueConstraint(
            "environment_id",
            "flag_key",
            name="uq_flags_environment_id_flag_key",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    environment_id: Mapped[int] = mapped_column(
        ForeignKey("environments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    flag_key: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    flag_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    flag_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="boolean",
    )

    default_value: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        default="false",
    )

    enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    owner_team: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(UTC)
    )

    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    environment: Mapped["Environment"] = relationship(
        back_populates="flags"
    )

    versions: Mapped[list["FlagVersion"]] = relationship(
        back_populates="flag",
        cascade="all, delete-orphan",
    )

    targeting_rules: Mapped[list["TargetingRule"]] = relationship(
        back_populates="flag",
        cascade="all, delete-orphan",
    )