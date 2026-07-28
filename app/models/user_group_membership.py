from __future__ import annotations
from datetime import UTC, datetime

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class UserGroupMembership(Base):
    """Links users to groups."""

    __tablename__ = "user_group_memberships"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    group_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(UTC)
    )