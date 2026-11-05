# Plan: Database export and import

Project: Unlocked Ventures

## Approach

Add Bash scripts that use the configured Compose PostgreSQL container for `pg_dump` and
`pg_restore`, and package or restore the local `media/` directory alongside the dump. Restore
only into a database with no user tables, only while the app service is stopped, and only when
the destination upload directory is empty. Add package commands and document the sender and
recipient workflows, data sensitivity, and limitations in the README.

## Affected files and design

| Area                  | Proposed change and paths                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| Data and integrations | Add `scripts/export-db.sh` and `scripts/import-db.sh` for PostgreSQL and media archive handling. |
| Tooling               | Add `db:export` and `db:import` package scripts; ignore generated `/backups/` archives.          |
| Documentation         | Document export and import steps, recipient setup, privacy, and compatibility in `README.md`.    |

## Content compatibility and rollout

No schema or content changes. The recipient restores into an empty database before starting
the app, so startup schema setup and empty-content seeds do not run against existing records.
Use a project revision compatible with the database dump.

## Generated outputs

- Payload schema changes: not applicable.
- Admin import-map inputs: not applicable.

## Failure handling and recovery

Export and import commands must fail explicitly on PostgreSQL, archive, or filesystem errors.
Import must not drop an existing database or overwrite non-empty media. Restore database objects
in a single transaction where supported by `pg_restore`.

## Verification strategy

Run Bash syntax checks on both scripts, inspect package/README command consistency, and run the
available focused static checks. Do not run export or restore against a real database as part of
verification.

## Operations impact

Requires Docker Compose and a running PostgreSQL service for export; import requires PostgreSQL
running with the app stopped. Generated archive files are stored under the ignored `backups/`
directory by default.

## Related decisions and unresolved questions

The user selected full database records. No schema migration or external service change is
required.
