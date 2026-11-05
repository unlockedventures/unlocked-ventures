# Intent: Database export and import

Project: Unlocked Ventures

- Status: done
- Gate status: not applicable
- Ticket or issue: none
- Owner: not specified

## Business goal

Let a project maintainer package the current PostgreSQL database and local Payload uploads,
then let a collaborator restore that snapshot into an empty database for this project.

## Users and stakeholders

Project maintainers exporting data and collaborators setting up a local copy.

## Scope

- Included: Docker Compose export/import scripts, package commands, operational documentation,
  and protection against accidentally overwriting an initialized destination database.
- Excluded: selective content export, production deployment, and transferring environment
  secrets or PostgreSQL cluster roles.

## Affected areas

- PostgreSQL and local Payload upload files.
- Repository scripts, package commands, `.gitignore`, and `README.md`.

## Constraints

- The database uses PostgreSQL 16 in Docker Compose.
- Upload files are stored separately from PostgreSQL under the local `media/` directory.
- Full database exports include account records and contact submissions; only share them with
  a trusted recipient.
- The recipient must use a compatible project version and an empty database.

## Success criteria

- A maintainer can export one archive containing a PostgreSQL custom-format dump and local
  uploads.
- A collaborator can restore that archive before starting the application, without replacing
  existing database tables or local uploads.

## Risks and open questions

- An export may contain personal or confidential content, including contact submissions and
  account password hashes.
- Upload files can make the archive large; no size limit is specified.
