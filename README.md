# Unlocked Ventures

Marketing site and content admin for Unlocked Ventures. The public site is a Next.js app. Editors manage pages, media, and site content in [Payload CMS](https://payloadcms.com).

## Run with Docker

Install [Docker](https://docs.docker.com/get-docker/) with Compose. `docker compose up -d` starts PostgreSQL in its own container, then starts the app in the background.

```bash
git clone https://github.com/BrainStation-23/unlocked-venture.git
cd unlocked-venture
git checkout develop
cp .env.example .env
docker compose up -d
```

The app reads `DATABASE_URL` and `PAYLOAD_SECRET` from `.env`. For this Compose file, `DATABASE_URL` must be:

```bash
postgresql://payload:payload@postgres:5432/unlocked_ventures
```

`postgres` is the database container’s name. The user, password, and database name match the container.

The first start installs dependencies, creates the database tables, and fills empty content with the built-in site seed. Later starts leave content that already exists.

If the Postgres volume already has tables from an older checkout, Docker applies additive schema updates (`scripts/ensure-schema.sql`) before the app boots. That keeps new code working on old volumes without interactive Payload prompts. Extra columns are additive only, so checking out older code against a newer database remains safe.

Without Docker, after pulling schema changes against an existing database, run:

```bash
pnpm ensure-schema
```

Or Payload’s migration runner (`pnpm migrate`), which applies the same additive SQL from `src/migrations`.

### Seed CMS data

After the stack is up, fill or refresh demo content from the app container:

```bash
docker compose exec app sh -c 'PAYLOAD_DB_PUSH=false npx tsx scripts/seed-all.mts'
```

Or:

```bash
docker compose exec app pnpm seed
```

Seeds are mostly idempotent: they fill empty fields and leave existing editor content alone where possible. Use this after a fresh database, or when podcast / insights demo data is missing.

Open:

- Site: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

On the first visit to the admin, create the first editor account. Use that email and password to sign in afterward.

Stop the app with `docker compose down`. Follow the logs with `docker compose logs -f`.

`PAYLOAD_SECRET` should be a long random string (`openssl rand -hex 32`). `.env` stays on your machine. Do not commit it.

## Run without Docker

### Prerequisites

- Node.js 20.9 or newer (18.20.2 or newer is also accepted)
- pnpm 9, 10, or 11
- PostgreSQL 15 or newer

Enable pnpm with Corepack if it is not already installed:

```bash
corepack enable
corepack prepare pnpm@10 --activate
```

### Setup

1. Clone the repository and move into it:

```bash
git clone https://github.com/BrainStation-23/unlocked-venture.git
cd unlocked-venture
git checkout develop
```

2. Install dependencies:

```bash
pnpm install
```

3. Start PostgreSQL and create a database named `unlocked_ventures`.

4. Create the local environment file:

```bash
cp .env.example .env
```

5. Open `.env` and set both values:

- `DATABASE_URL` must match your PostgreSQL user, password, host, port, and database. On your machine the host is `127.0.0.1`, not `postgres`.
- `PAYLOAD_SECRET` must be a long random string. Generate one with:

```bash
openssl rand -hex 32
```

`.env` stays on your machine. Do not commit it.

### Start

```bash
pnpm dev
```

The first start creates the database tables and fills empty content with the built-in site seed. Later starts leave content that already exists. The site and admin URLs are the same as in the Docker section.

## Production

Set `DATABASE_URL` and `PAYLOAD_SECRET` in the environment, then:

```bash
pnpm build
pnpm start
```

The app listens on port 3000.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm devsafe` | Clear the Next.js cache, then start the development server |
| `pnpm build` | Build for production |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm seed` | Seed CMS demo content (globals, podcasts, insights, etc.) |
| `pnpm test` | Run unit tests, then end-to-end tests |
| `pnpm payload` | Run the Payload CLI |
| `docker compose up -d` | Start the app and its PostgreSQL container in the background |
| `docker compose exec app pnpm seed` | Seed CMS data inside the running Docker app container |

End-to-end tests need Playwright browsers:

```bash
pnpm exec playwright install
pnpm test
```

## Admin roles and permissions

Super Admins manage accounts under **Accounts → Portal users** and permissions
under **Accounts → Roles**. Create a role, select collection Create/Read/Update/Delete
permissions (or Read/Update for page globals), then assign it to a user. Write
permissions require Read. Contact messages remain read only. A user without a role
has no content permissions. Only Super Admins can manage users and roles; regular
users can update their own account credentials but cannot change their access.

For existing databases, run `pnpm ensure-schema` (inside the app container for
Docker) or `pnpm migrate` before serving the new code. The one-time bootstrap
promotes the designated existing account, `abir@yopmail.com`, to active Super Admin.
Other existing accounts receive no content permissions until assigned a role.
The bootstrap receipt prevents later restarts from restoring revoked privileges.
For a fresh database, only the designated email can register the first account;
run the schema command after tables exist to install database-level safeguards.
The last active Super Admin cannot be demoted, disabled, or deleted.

Server requests resolve current account and role data, so changed grants and
account disabling take effect on subsequent requests. Refresh the admin to update
its visible actions. Public content remains readable; the contact inbox and account
and role data are protected. Intentional system operations (content seeds, public
contact ingestion, and internal metadata lookups) keep their narrowly scoped
access bypasses. Podcast generation requires episode Read/Update and, when
creating audio, Podcast audio Create permission.

To run database-backed access checks with temporary fixtures (cleaned up afterward):

```bash
docker compose exec -T -e PAYLOAD_DB_PUSH=false app pnpm exec tsx scripts/verify-rbac.mts
```
