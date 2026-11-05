# Requirements: Database export and import

Project: Unlocked Ventures

## Functional requirements

- FR-1: Provide a command that exports the current Docker Compose PostgreSQL database in a
  portable format and includes the local `media/` upload directory in one shareable archive.
- FR-2: Provide a command that restores the database and uploads from that archive before the
  application starts.
- FR-3: Refuse to restore when the application is running, the target database already contains
  tables, or the local upload directory is non-empty.
- FR-4: Keep generated archives out of version control by default.

## Content and compatibility

The archive contains database schema and data, including account and contact records, plus local
Payload upload files. It does not contain `.env`, `PAYLOAD_SECRET`, SMTP/provider credentials,
PostgreSQL cluster roles, or other environment configuration. The recipient supplies their own
environment and must use compatible application code.

## Authorization and data protection

Export and restore are explicit local operator commands. The export can contain private personal
data and account password hashes; document that it must be transferred only to a trusted person
using an appropriately protected channel. Do not log or include credentials.

## Quality requirements

- Fail with a clear error if the PostgreSQL service cannot be used or an archive is invalid.
- Do not silently overwrite an existing database or local uploads during restore.
- Work with the repository's Docker Compose PostgreSQL service without requiring host-installed
  PostgreSQL tools.

## Acceptance criteria

- AC-1: Given a running PostgreSQL service, when the export command runs, then it writes an
  archive containing a PostgreSQL custom-format dump and the local upload directory.
- AC-2: Given a stopped application, an empty database, and an empty or absent local `media/`
  directory, when the import command runs with a valid archive, then the database and uploads
  are restored.
- AC-3: Given a non-empty target database, running application, non-empty upload directory, or
  invalid archive, when import is attempted, then it exits with an actionable error without
  intentionally replacing the existing data.

## Open questions

| ID  | Question                                                                           | Answer or evidence                  | Status   |
| --- | ---------------------------------------------------------------------------------- | ----------------------------------- | -------- |
| Q1  | Should the export include all records, including accounts and contact submissions? | User selected all database records. | resolved |

## Assumptions

- The recipient has Docker Compose and runs the same compatible project revision.
- The recipient starts only the PostgreSQL service before importing, then starts the app afterward.
- The archive is treated as sensitive because it contains all records.

## Verification constraints

Use static shell syntax validation and review the command paths. Do not run database export or
restore against the current database as part of implementation verification.
