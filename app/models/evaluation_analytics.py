from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class EvaluationAnalytics(Base):
    """Stores hourly feature flag evaluation counts."""

    __tablename__ = "evaluation_analytics"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    flag_key: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    environment_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    evaluation_hour: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True,
    )

    evaluation_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    __table_args__ = (
        UniqueConstraint(
            "flag_key",
            "environment_name",
            "evaluation_hour",
            name="uq_evaluation_analytics_hour",
        ),
    )