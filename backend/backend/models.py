from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Column,
    Computed,
    DateTime,
    ForeignKeyConstraint,
    Identity,
    Index,
    PrimaryKeyConstraint,
    SmallInteger,
    String,
    Table,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()
metadata = Base.metadata


class Users(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "(email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)",
            name="users_email_change_confirm_status_check",
        ),
        PrimaryKeyConstraint("id", name="users_pkey"),
        UniqueConstraint("phone", name="users_phone_key"),
        Index("confirmation_token_idx", "confirmation_token", unique=True),
        Index("email_change_token_current_idx", "email_change_token_current", unique=True),
        Index("email_change_token_new_idx", "email_change_token_new", unique=True),
        Index("reauthentication_token_idx", "reauthentication_token", unique=True),
        Index("recovery_token_idx", "recovery_token", unique=True),
        Index("users_email_partial_key", "email", unique=True),
        Index("users_instance_id_idx", "instance_id"),
        {"comment": "Auth: Stores user login data within a secure schema.", "schema": "auth"},
    )

    id = Column(UUID)
    is_sso_user = Column(
        Boolean,
        nullable=False,
        server_default=text("false"),
        comment="Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.",
    )
    instance_id = Column(UUID)
    aud = Column(String(255))
    role = Column(String(255))
    email = Column(String(255))
    encrypted_password = Column(String(255))
    email_confirmed_at = Column(DateTime(True))
    invited_at = Column(DateTime(True))
    confirmation_token = Column(String(255))
    confirmation_sent_at = Column(DateTime(True))
    recovery_token = Column(String(255))
    recovery_sent_at = Column(DateTime(True))
    email_change_token_new = Column(String(255))
    email_change = Column(String(255))
    email_change_sent_at = Column(DateTime(True))
    last_sign_in_at = Column(DateTime(True))
    raw_app_meta_data = Column(JSONB)
    raw_user_meta_data = Column(JSONB)
    is_super_admin = Column(Boolean)
    created_at = Column(DateTime(True))
    updated_at = Column(DateTime(True))
    phone = Column(Text, server_default=text("NULL::character varying"))
    phone_confirmed_at = Column(DateTime(True))
    phone_change = Column(Text, server_default=text("''::character varying"))
    phone_change_token = Column(String(255), server_default=text("''::character varying"))
    phone_change_sent_at = Column(DateTime(True))
    confirmed_at = Column(
        DateTime(True), Computed("LEAST(email_confirmed_at, phone_confirmed_at)", persisted=True)
    )
    email_change_token_current = Column(String(255), server_default=text("''::character varying"))
    email_change_confirm_status = Column(SmallInteger, server_default=text("0"))
    banned_until = Column(DateTime(True))
    reauthentication_token = Column(String(255), server_default=text("''::character varying"))
    reauthentication_sent_at = Column(DateTime(True))
    deleted_at = Column(DateTime(True))

    node = relationship("Node", back_populates="user")
    step = relationship("Step", back_populates="user")
    user_role = relationship("UserRole", back_populates="user")


class NodeType(Base):
    __tablename__ = "node_type"
    __table_args__ = (PrimaryKeyConstraint("name", name="node_type_pkey"),)

    name = Column(Text)
    icon = Column(Text)
    top_level = Column(Boolean, server_default=text("false"))


class Node(Base):
    __tablename__ = "node"
    __table_args__ = (
        ForeignKeyConstraint(["user_id"], ["auth.users.id"], name="node_user_id_fkey"),
        PrimaryKeyConstraint("id", name="node_pkey"),
    )

    id = Column(
        BigInteger,
        Identity(
            start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1
        ),
    )
    type = Column(Text, nullable=False)
    user_id = Column(UUID, nullable=False)
    data = Column(JSONB)
    public = Column(Boolean, server_default=text("false"))

    user = relationship("Users", back_populates="node")


class Profile(Users):
    __tablename__ = "profile"
    __table_args__ = (
        ForeignKeyConstraint(["id"], ["auth.users.id"], ondelete="CASCADE", name="profile_id_fkey"),
        PrimaryKeyConstraint("id", name="profile_pkey"),
        UniqueConstraint("username", name="profile_username_key"),
    )

    id = Column(UUID)
    username = Column(Text, nullable=False)


class Step(Base):
    __tablename__ = "step"
    __table_args__ = (
        ForeignKeyConstraint(["user_id"], ["auth.users.id"], name="step_user_id_fkey"),
        PrimaryKeyConstraint("id", name="step_pkey"),
    )

    id = Column(
        BigInteger,
        Identity(
            start=1, increment=1, minvalue=1, maxvalue=9223372036854775807, cycle=False, cache=1
        ),
    )
    description = Column(Text, nullable=False)
    bucket = Column(Text, nullable=False)
    object_name = Column(Text, nullable=False)
    user_id = Column(UUID, nullable=False)

    user = relationship("Users", back_populates="step")


class UserRole(Base):
    __tablename__ = "user_role"
    __table_args__ = (
        CheckConstraint(
            "role = ANY (ARRAY['admin'::text, 'curator'::text])", name="user_role_role_check"
        ),
        ForeignKeyConstraint(
            ["user_id"], ["auth.users.id"], ondelete="CASCADE", name="user_role_user_id_fkey"
        ),
        PrimaryKeyConstraint("user_id", "role", name="user_role_pkey"),
    )

    user_id = Column(UUID, nullable=False)
    role = Column(Text, nullable=False)

    user = relationship("Users", back_populates="user_role")


t_edge = Table(
    "edge",
    metadata,
    Column("source", BigInteger, nullable=False),
    Column("destination", BigInteger, nullable=False),
    Column("user_id", UUID, nullable=False),
    Column("data", JSONB),
    Column("public", Boolean, server_default=text("false")),
    ForeignKeyConstraint(["destination"], ["node.id"], name="edge_destination_fkey"),
    ForeignKeyConstraint(["source"], ["node.id"], name="edge_source_fkey"),
    ForeignKeyConstraint(["user_id"], ["auth.users.id"], name="edge_user_id_fkey"),
)
