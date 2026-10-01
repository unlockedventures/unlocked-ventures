# Unlocked Ventures

Marketing site and content admin for Unlocked Ventures. The public site is a Next.js app. Editors manage pages, media, and site content in [Payload CMS](https://payloadcms.com).

## Run with Docker

Install [Docker](https://docs.docker.com/get-docker/) with Compose. `docker compose up` starts PostgreSQL in its own container, then starts the app.

```bash
git clone https://github.com/BrainStation-23/unlocked-venture.git
cd unlocked-venture
git checkout develop
cp .env.example .env
docker compose up
```

The app reads `DATABASE_URL` and `PAYLOAD_SECRET` from `.env`. For this Compose file, `DATABASE_URL` must be:

```bash
postgresql://payload:payload@postgres:5432/unlocked_ventures
```

`postgres` is the database container’s name. The user, password, and database name match the container.

The first start installs dependencies, creates the database tables, and fills empty content with the built-in site seed. Later starts leave content that already exists.

Open:

- Site: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

On the first visit to the admin, create the first editor account. Use that email and password to sign in afterward.

Stop the app with Ctrl+C. Add `-d` to keep it running in the background: `docker compose up -d`.

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
| `pnpm test` | Run unit tests, then end-to-end tests |
| `pnpm payload` | Run the Payload CLI |
| `docker compose up` | Start the app and its PostgreSQL container |

End-to-end tests need Playwright browsers:

```bash
pnpm exec playwright install
pnpm test
```
