# Unlocked Ventures

Marketing site and content admin for Unlocked Ventures. The public site is a Next.js app. Editors manage pages, media, and site content in [Payload CMS](https://payloadcms.com).

The CMS covers company pages, solutions, case studies, awards, news, podcasts,
media, navigation, contact information, and a contact inbox. It also includes
podcast content generation tools. Repository development instructions and
engineering principles live in [AGENTS.md](AGENTS.md).

## Technology stack

- Next.js 16 App Router, React 19, and strict TypeScript.
- Payload CMS 3 with PostgreSQL and Lexical rich text editing.
- Tailwind CSS 4, Radix UI, shadcn, and Lucide icons.
- TanStack Query, Zustand, and React Hook Form.
- Nodemailer for optional SMTP delivery and Sharp for image processing.
- Vitest with Testing Library and Playwright for browser tests.
- pnpm for development and Docker Compose for the app and database.

See `package.json` for exact versions and supported runtime engines.

## Project structure

| Path                                            | Responsibility                                                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/payload.config.ts`                         | Collections, globals, admin views, adapters, seeds, endpoints                                                |
| `src/app/(frontend)/`                           | Public pages, layouts, styles, and public API routes                                                         |
| `src/app/(payload)/`                            | Payload admin and API integration, generated import map                                                      |
| `src/access/`                                   | Shared RBAC policies and permission definitions                                                              |
| `src/collections/`                              | Portal users, roles, media, awards, news, podcasts, case studies, badges, solutions, logos, contact messages |
| `src/globals/`                                  | Singleton page/section content, navigation, header, footer, site settings                                    |
| `src/components/admin/`                         | Custom dashboard, navigation, login, and editor controls                                                     |
| `src/admin/`                                    | Shared editor guidance and admin organization                                                                |
| `src/components/`, `src/blocks/`, `src/fields/` | Shared UI, content blocks, field definitions                                                                 |
| `src/lib/`, `src/hooks/`, `src/stores/`         | Helpers, hooks, client state                                                                                 |
| `src/endpoints/`                                | Custom Payload endpoints, including dashboard statistics                                                     |
| `src/pipeline/`, `src/studio/`                  | Podcast generation workflows and studio services                                                             |
| `src/data/`                                     | Content seeds and data backfills                                                                             |
| `src/migrations/`, `scripts/ensure-*.sql`       | Migrations and additive schema compatibility updates                                                         |
| `src/payload-types.ts`                          | Generated Payload types                                                                                      |
| `tests/int/`, `tests/e2e/`                      | Vitest and Playwright suites                                                                                 |
| `public/brand/`                                 | Unlocked Ventures brand assets                                                                               |

Imports use `@/*` for `src/` and `@payload-config` for the Payload configuration.

## Run with Docker

Install [Docker](https://docs.docker.com/get-docker/) with Compose. `docker compose up -d` starts
PostgreSQL, the transcription service and the pinned self-hosted Kokoro speech service, then starts
the app in the background.

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

Consult `.env.example` for optional integrations. SMTP delivery is enabled when
`SMTP_HOST` is configured; keep credentials out of source files and logs.

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

| Command                             | What it does                                                 |
| ----------------------------------- | ------------------------------------------------------------ |
| `pnpm install`                      | Install dependencies                                         |
| `pnpm dev`                          | Run the schema precheck and start the development server     |
| `pnpm devsafe`                      | Clear the Next.js cache, then start the development server   |
| `pnpm build`                        | Build for production                                         |
| `pnpm start`                        | Serve the production build                                   |
| `pnpm lint`                         | Run ESLint                                                   |
| `pnpm exec tsc --noEmit`            | Check TypeScript                                             |
| `pnpm ensure-schema`                | Apply additive schema compatibility updates                  |
| `pnpm migrate`                      | Run Payload migrations                                       |
| `pnpm generate:types`               | Regenerate Payload types after schema changes                |
| `pnpm generate:importmap`           | Regenerate the admin component import map                    |
| `pnpm seed`                         | Seed CMS demo content (globals, podcasts, insights, etc.)    |
| `pnpm test:int`                     | Run Vitest integration/component tests                       |
| `pnpm test:e2e`                     | Run Playwright; starts or reuses the development server      |
| `pnpm test`                         | Run integration/component tests, then end-to-end tests       |
| `pnpm test:web-vitals`              | Generate web performance reports                             |
| `pnpm payload`                      | Run the Payload CLI                                          |
| `docker compose up -d`              | Start the app and its PostgreSQL container in the background |
| `docker compose exec app pnpm seed` | Seed CMS data inside the running Docker app container        |

Database-backed checks require configured PostgreSQL. End-to-end tests need
Playwright browsers:

```bash
pnpm exec playwright install
pnpm test
```

## Per-video transcription tracking

Each AI episode video link stores a transcription status (Pending, Processing,
Completed, or Failed), its generated result, the URL used for that result, and any
error. Generate Transcript processes only resources without a completed result
for their current URL. It preserves previously generated combined transcript text,
retries failed resources, and saves each video's completion before continuing.
Changing a video URL resets that row to Pending and clears its old result on save.
Job fields are read only and ordinary editor saves cannot forge their values.

Run `pnpm ensure-schema` or `pnpm migrate` before serving this schema change.
Existing rows without recorded statuses start Pending; their combined transcript
is preserved, but their next generation records explicit per-video results. The
system no longer infers completion from editable transcript headings.

Database smoke checks use synthetic results and remove their temporary episode:

```bash
docker compose exec -T -e PAYLOAD_DB_PUSH=false app pnpm exec tsx scripts/verify-video-transcription.mts
```

## AI episode source summaries

AI episodes now follow **video transcripts → source summary → podcast script →
podcast audio**. After every current video has a completed, nonblank transcript,
save any source edits and select **Generate source summary**. This separate Gemini
operation summarizes the complete combined source text without truncating it.
Provider capacity or timeout failures retain earlier content and show an error.
The combined source summary is editable and separate from the episode's published
Summary. Script generation submits and saves the edited source summary, and uses
that text rather than falling back to raw transcripts.

Changing the video set or source transcript marks the summary outdated without
deleting previous summaries, scripts or audio. Generate a current source summary
before requesting another podcast script, including for existing AI episodes.
Incomplete drafts and manual episodes do not require a source summary.

**Schema rollout prerequisite:** apply `pnpm ensure-schema` or `pnpm migrate`
against the target database before serving this code. The registered
`20261023_120000_source_summary` migration and `scripts/ensure-source-summary.sql`
add the summary, source identities, job state and generation lease columns without
backfilling or replacing content. Docker's existing schema precheck includes the
new SQL. Production startup does not automatically run this rollout. These
database commands were prepared but not executed as part of this change.

Episode generation actions share an atomic database lease, preventing duplicate
or conflicting transcription, summary, script and audio requests across workers.
Normal completion and failure release it; after a crashed worker, it expires
after one hour. Reload the editor and retry Generate source summary after expiry
to recover. Source changes are rechecked before accepting generated output.
Rolling application code back leaves these additive columns and saved text intact.

## Self-hosted podcast audio

AI episode audio is generated by the self-hosted Kokoro service in Docker. The admin loads available
Kokoro voices from the server, then generates host and guest turns in script order. The application
joins raw 24 kHz mono PCM with dialogue pauses and writes a preview WAV through the `podcast-audio`
Payload upload collection. Generation does not replace the public episode audio. Editors listen to
the preview, regenerate it if needed, and select **Save Generated Audio** to publish that audio to
the episode. **Save as Complete** requires saved audio for AI episodes and is disabled while an
unsaved generated preview exists; **Save as Draft** remains available. Transcription source video
links are never automatically assigned as public playback media. Existing AI episodes without saved
audio also hide legacy source-video playback until audio is saved. Until audio is saved, the public player continues streaming the previously saved audio and never
uses browser speech synthesis when a transcript is present.

Docker sets `KOKORO_BASE_URL=http://kokoro:8880` and keeps port 8880 private to the Compose network.
The service image is pinned in `docker-compose.yml`. Outside Compose, set `KOKORO_BASE_URL` to the
server-reachable Kokoro-FastAPI base URL. Optional `KOKORO_MODEL`, `KOKORO_SPEED`, and
`KOKORO_TIMEOUT_MS` values are documented in `.env.example`. No ElevenLabs key is required.

Episode Duration is derived from the generated PCM length, including inserted pauses. For manually
uploaded audio, the server reads duration metadata while the upload buffer is available. The existing
Duration string remains the value used on cards, listings, and episode details. Editors can override it; ordinary saves preserve the edited value, while
saving newly generated audio or attaching replacement audio recalculates it. Apply `pnpm ensure-schema` or `pnpm migrate` before serving this change against an
existing database. Migration `20261028_120000_podcast_audio_duration` adds hidden numeric duration
metadata, and `20261028_150000_podcast_audio_preview` adds the pending-preview relationship without
changing existing published audio relationships.

Audio remains on local disk for this rollout. A later Payload S3 storage-adapter change can move
`podcast-audio` objects to S3 while PostgreSQL retains metadata, resolved URLs, and episode
relationships. The Kokoro pipeline writes through Payload rather than directly to disk or S3.

After startup, open an AI episode, select distinct Host and Guest Kokoro voices, generate audio,
listen to the preview, then save or regenerate it. If voice loading or generation fails, check
`docker compose ps kokoro` and
`docker compose logs kokoro`; saved scripts and previous episode audio are retained.

## Homepage menu sources

Under **Home → Strategic Advisory** or **Home → Digital Engineering**, choose a
**Header menu source** and save. The read-only preview shows the selected parent's
groups and links. Names, destinations, external-link behavior and ordering come
from **Menus → Header menu**; edit them there. All parents are selectable, including
ones hidden from the header. “Published in header” controls only the header.

Section headings, descriptions and card presentation remain editable. Presentation
rows are created automatically from the selected parent's groups, in source order;
there is no manual group selection. Existing icons and descriptions stay associated
with stable group IDs across renames and reordering. On first selection, uniquely
matching existing group names are associated automatically. Unused presentation
is archived for reuse when switching menus. Photo and Image Alt are no longer
shown in the Digital Engineering editor. New groups render without icons until
configured. Previous offerings remain stored and render until a source is chosen;
a missing or empty selected source hides the public section and shows an admin
warning. Header edits appear on a fresh homepage load or normal data refetch.

Run `pnpm ensure-schema` or `pnpm migrate` before serving this schema on an existing
database. Migration `20261023_140000_home_menu_sources` adds source IDs and relaxes
optional presentation constraints without deleting content. Docker's schema
precheck includes the same SQL. The additive columns remain on rollback.

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
