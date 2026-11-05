# Decision and Change Log: Database export and import

Project: Unlocked Ventures

| Date       | Actor, if known | Type         | Summary and scope                                                                                                                                                              | Evidence or link                                                                          |
| ---------- | --------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| 2026-11-05 | User            | decision     | Selected a full database export, including private records such as accounts and contact submissions.                                                                           | User response in this session                                                             |
| 2026-11-05 | Copilot         | decision     | Plan a single archive containing a PostgreSQL dump and local uploads; guard restore against non-empty targets.                                                                 | `requirements.md` and `plan.md`                                                           |
| 2026-11-05 | Copilot         | change       | Added Docker-backed export/import commands, README instructions, and ignored `backups/` output.                                                                                | `scripts/export-db.sh`, `scripts/import-db.sh`, `package.json`, `.gitignore`, `README.md` |
| 2026-11-05 | Copilot         | verification | Exported the current database and uploads, validated the archive and restored it into an isolated temporary PostgreSQL database; the target project database was not modified. | `pnpm db:export`; isolated restore: 92 tables and 240 media files                         |
| 2026-11-05 | Copilot         | verification | Confirmed import refuses a running app, a non-empty database, and a non-empty media directory.                                                                                 | Guard checks against live app state and isolated temporary database                       |

## Verification details, if needed

No seed or schema command was run. The exported archive is stored locally under the ignored
`backups/` directory. Import was exercised only against an isolated temporary PostgreSQL
container, which was removed after verification; the existing project database was not restored
over or modified.
