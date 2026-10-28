# ADR 0001: Unlocked Ventures Application Architecture

- Recorded: 2026-10-28
- Status: Documents the existing implementation; no historical approval is asserted.
- Scope: Public marketing site, editorial administration and podcast generation.

## Context

Unlocked Ventures needs a public marketing site and an administration interface for managing
company pages, solutions, case studies, awards, news, podcasts, media, navigation and contact
information. Editors need to update content without changing application code. The application
also receives public contact submissions and supports AI-assisted podcast production.

The repository already implements these capabilities in a shared Next.js and Payload application.
This record captures that architecture and its constraints for future changes. It does not propose
a migration or establish a new deployment platform.

## Decision

### Application and presentation

Use Next.js App Router, React and strict TypeScript for the public site and Payload integration.
Keep public routes in `src/app/(frontend)/` and Payload admin/API integration in
`src/app/(payload)/`. Share components and domain helpers within the same application.

Use Tailwind CSS, existing Radix/shadcn UI primitives, Lucide icons and the brand assets in
`public/brand/`. Retain established TanStack Query, Zustand and React Hook Form patterns where
applicable. Keep credentials and privileged operations on the server.

### Content and persistence

Use Payload CMS 3 with its PostgreSQL adapter and Lexical editor. Define repeatable content in
collections and singleton page/section content in globals. Register these through
`src/payload.config.ts`; load public content through the existing data loaders.

Preserve schema slugs, public routes, relationships and existing editor content when evolving
schemas. Generate Payload types and the admin import map with the documented commands when
their inputs change. Generated files are not hand-maintained.

Use additive migrations and compatibility SQL for existing database volumes. Review startup seeds
and backfills before running against populated databases. Schema rollout is an explicit operational
step; a production application start does not replace migration execution.

### Authorization and public submissions

Enforce collection/global permissions through the shared server-side RBAC policies in
`src/access/`. Custom endpoints and Payload Local API calls must preserve the same authorization
boundaries, with only narrowly scoped intentional system bypasses.

Account and role administration is restricted to Super Admins. Preserve protections against
removing the last active Super Admin and against ordinary users granting themselves privileges.
Admin visibility and read-only fields supplement server enforcement.

Keep contact messages protected and disallow collection create/update/delete. Public submissions
enter through the contact route, which owns the controlled ingestion boundary.

### Navigation reuse

Treat the `navigation` global as the source of Header menu content; `site-header` remains a
separate CTA global. Homepage Strategic Advisory and Digital Engineering reuse a selected parent
menu independently of its header visibility.

Associate inherited content and presentation using stable parent/group row IDs. Names, links and
ordering come from navigation; homepage presentation stays editable. Preserve legacy offerings,
icons, descriptions and archived presentation when sources change.

### Podcast generation and integrations

Keep podcast generation logic in the existing `src/pipeline/` and `src/studio/` areas. AI episodes
progress through video transcripts, source summary, podcast script and podcast audio.

Persist per-video progress and source identities, preserve prior generated content on failure or
source changes, and require a current source summary for script generation. Preserve database
generation leases and source rechecks to prevent conflicting operations and stale results.
Enforce episode and audio permissions on the server.

Docker Compose defines a separate transcription service alongside the application and PostgreSQL.
Keep provider configuration and service credentials in the environment. SMTP delivery is optional
and uses the existing Nodemailer adapter. Exact integration settings belong in `.env.example`,
without real credentials.

### Development and operations

Use pnpm and the scripts in `package.json`. Docker Compose provides a development stack with
PostgreSQL, the transcriber and the application. Production builds use `pnpm build` and
`pnpm start`; this record does not specify a production hosting provider or release pipeline.

Use ESLint and TypeScript checks and meaningful Vitest/Playwright tests as appropriate to each
task. Respect task-specific verification instructions, including the current no-automated-tests
preference for the homepage menu-source change. Documentation changes do not require database
operations or application startup.

## Consequences

- Public rendering and editorial schemas can evolve together using shared TypeScript definitions.
- A shared application simplifies local development, while coupling public-site and admin releases.
- PostgreSQL availability and explicit schema compatibility are prerequisites for database-backed
  behavior. Additive changes preserve stored content but require rollout discipline.
- CMS-driven content reduces hard-coded copy, while requiring care with relationships, row IDs and
  legacy data when editors change navigation or presentation.
- External generation services can fail or take time; persisted progress, leases and source checks
  remain necessary. This record does not establish a durable queue or worker deployment design.
- Server-side authorization must cover every entry point, including custom generation endpoints
  and intentional Local API bypasses.

## Alternatives and future changes

A separate frontend/backend deployment, a different CMS/database, and a dedicated generation queue
would be architectural changes. No historical evaluation or rejection of those options is claimed
here. Evaluate them in a later ADR if a concrete requirement warrants the additional complexity.

## Evidence and references

Paths in the decision text are relative to the repository root. The following files describe or
implement the current architecture:

- [Project setup and operational behavior](../../../README.md)
- [Repository working agreement](../../../AGENTS.md)
- [Dependencies and commands](../../../package.json)
- [TypeScript configuration](../../../tsconfig.json)
- [Payload configuration](../../../src/payload.config.ts)
- [RBAC implementation](../../../src/access/rbac.ts)
- [Permission resources](../../../src/access/resources.ts)
- [Contact message collection](../../../src/collections/ContactMessages.ts)
- [Navigation schema](../../../src/globals/Navigation.ts)
- [Generation lease implementation](../../../src/pipeline/episode-generation-lock.ts)
- [Generation endpoints](../../../src/pipeline/episode-ai-endpoints.ts)
- [Development services](../../../docker-compose.yml)

This is a source-based architecture record, not evidence of runtime validation or production
readiness. No migrations, seeds, deployment actions or application tests are executed by adding it.
