# Tasks: Database export and import

Project: Unlocked Ventures

| ID  | Task                                                                              | Status | Owner, if known | Evidence or notes                                           |
| --- | --------------------------------------------------------------------------------- | ------ | --------------- | ----------------------------------------------------------- |
| T1  | Add PostgreSQL/media export and guarded import scripts.                           | done   | not specified   | AC-1, AC-2, AC-3                                            |
| T2  | Add package commands, ignore local archives, and document collaboration workflow. | done   | not specified   | FR-1 through FR-4                                           |
| T3  | Run focused static validation and record results.                                 | done   | not specified   | Bash syntax, formatting, archive, restore, and guard checks |

## Completion checks

- [x] Requested behavior implemented with existing project patterns.
- [x] No persisted editor content, slugs, routes or relationships changed.
- [x] No server endpoint or authorization behavior changed.
- [x] No schema migration or compatibility SQL required.
- [x] Payload types and admin import map generation not applicable.
- [x] Static checks and isolated database restore/guard checks completed.
- [x] README and feature records updated; live import into the existing database was not attempted.

## Handoff notes, when needed

### 2026-11-05 — Copilot

- Completed: Confirmed PostgreSQL 16 Compose service and local uploads under `media/`; user chose
  a full database export.
- Completed: Added export/import scripts, package commands, ignored backup output, and README
  workflow. Created and validated a full archive; restored it in an isolated temporary database.
- Next: Recipient can import the archive into an empty compatible checkout.
- Constraints: The archive contains private database records; transfer it securely. The live
  project database was not used for restore verification.
- Files touched: `scripts/export-db.sh`, `scripts/import-db.sh`, `package.json`, `.gitignore`,
  `README.md`, and this feature record.
- Checks run: `bash -n`, `git diff --check`, Prettier check, archive integrity/custom dump listing,
  isolated restore (92 tables and 240 uploaded files), running-app refusal, and non-empty
  database/media refusal.
