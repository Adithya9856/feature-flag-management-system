This schema is a research-based implementation created for learning and prototyping. It may be updated to match the mentor's official database design as the project evolves.
# Database Schema
## Feature Flag Management System

This document describes the database schema used in the Feature Flag Management System.

---

# Database Overview

The project uses PostgreSQL with SQLAlchemy ORM and Alembic for database migrations.

There are six main tables:

1. Environments
2. Flags
3. Flag Versions
4. Targeting Rules
5. User Group Memberships
6. Audit Logs

---

# Entity Relationship

```
Environment (1)
    │
    │ 1 ──────────── N
    ▼
Flag
    │
    ├──────────────► FlagVersion
    │
    └──────────────► TargetingRule

UserGroupMembership

AuditLog
```

---

# 1. Environments

Stores deployment environments where feature flags are configured.

### Columns

| Column | Type | Constraints |
|---------|------|-------------|
| id | Integer | Primary Key |
| name | VARCHAR(100) | Unique, Not Null |
| description | VARCHAR(500) | Nullable |
| created_at | TIMESTAMP | Not Null |
| updated_at | TIMESTAMP | Not Null |

### Relationships

- One Environment can have many Flags.

---

# 2. Flags

Stores feature flag information.

### Columns

| Column | Type | Constraints |
|---------|------|-------------|
| id | Integer | Primary Key |
| environment_id | Integer | Foreign Key → environments.id |
| flag_key | VARCHAR(100) | Unique |
| flag_name | VARCHAR(200) | Not Null |
| description | VARCHAR(500) | Nullable |
| flag_type | VARCHAR(50) | Default: boolean |
| default_value | VARCHAR(500) | Default: false |
| enabled | Boolean | Default: True |
| owner_team | VARCHAR(100) | Nullable |
| created_at | TIMESTAMP | Not Null |
| updated_at | TIMESTAMP | Not Null |

### Relationships

- Belongs to one Environment.
- Has many Flag Versions.
- Has many Targeting Rules.

---

# 3. Flag Versions

Stores the version history of feature flags.

### Columns

| Column | Type | Constraints |
|---------|------|-------------|
| id | Integer | Primary Key |
| flag_id | Integer | Foreign Key → flags.id |
| version_number | Integer | Not Null |
| value | VARCHAR(500) | Not Null |
| change_description | VARCHAR(500) | Nullable |
| created_at | TIMESTAMP | Not Null |

### Relationships

- Belongs to one Flag.

---

# 4. Targeting Rules

Defines how a feature flag is rolled out to different users.

### Columns

| Column | Type | Constraints |
|---------|------|-------------|
| id | Integer | Primary Key |
| flag_id | Integer | Foreign Key → flags.id |
| rule_priority | Integer | Default: 1 |
| rule_type | VARCHAR(50) | Not Null |
| target_value | VARCHAR(200) | Not Null |
| percentage | Integer | Nullable |
| enabled | Boolean | Default: True |
| created_at | TIMESTAMP | Not Null |
| updated_at | TIMESTAMP | Not Null |

### Relationships

- Belongs to one Flag.

---

# 5. User Group Memberships

Stores user-to-group mappings.

### Columns

| Column | Type | Constraints |
|---------|------|-------------|
| id | Integer | Primary Key |
| user_id | VARCHAR(100) | Indexed |
| group_name | VARCHAR(100) | Indexed |
| created_at | TIMESTAMP | Not Null |

Purpose:

- Used to determine whether a user belongs to a specific group during feature evaluation.

---

# 6. Audit Logs

Stores all important system activities.

### Columns

| Column | Type | Constraints |
|---------|------|-------------|
| id | Integer | Primary Key |
| actor | VARCHAR(100) | Not Null |
| action | VARCHAR(50) | Not Null |
| table_name | VARCHAR(100) | Not Null |
| record_id | VARCHAR(100) | Nullable |
| previous_data | VARCHAR(2000) | Nullable |
| new_data | VARCHAR(2000) | Nullable |
| timestamp | TIMESTAMP | Not Null |

Purpose:

- Tracks all create, update, and delete operations for auditing and debugging.

---

# Foreign Key Relationships

| Parent Table | Child Table | Relationship |
|---------------|-------------|--------------|
| environments | flags | One-to-Many |
| flags | flag_versions | One-to-Many |
| flags | targeting_rules | One-to-Many |

---

# Database Migration

Database schema is managed using Alembic.

Generate a migration:

```bash
alembic revision --autogenerate -m "create initial tables"
```

Apply the migration:

```bash
alembic upgrade head
```

Rollback the last migration:

```bash
alembic downgrade -1
```

Show migration history:

```bash
alembic history
```

Check current migration version:

```bash
alembic current
```

---

# Database Summary

| Table | Purpose |
|---------|---------|
| environments | Stores deployment environments |
| flags | Stores feature flags |
| flag_versions | Maintains version history |
| targeting_rules | Defines feature rollout rules |
| user_group_memberships | Maps users to groups |
| audit_logs | Records system activities |

---

# Technologies

- FastAPI
- PostgreSQL
- SQLAlchemy ORM
- Alembic
- Psycopg2
# Database Design Notes

## Why SQLAlchemy?

SQLAlchemy provides an Object Relational Mapping (ORM) layer that allows Python classes to represent PostgreSQL tables. It simplifies CRUD operations and database interactions while keeping the code maintainable.

## Why Alembic?

Alembic is the migration tool used with SQLAlchemy.

Advantages:

- Version controls the database schema.
- Generates migrations automatically.
- Keeps all developers' databases synchronized.
- Supports upgrades and rollbacks.
- Eliminates the need to manually create tables.

Migration Commands:

```bash
alembic revision --autogenerate -m "message"
alembic upgrade head
alembic downgrade -1
alembic current
alembic history
---

Last Updated: July 2026