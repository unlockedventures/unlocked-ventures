# Requirements: Podcast listing seed preserves episode channels

Project: Unlocked Ventures

## Functional requirements

- FR-1: `seedPodcastListing` must not change any field of an episode whose slug is not in its
  starter `episodeMeta` table.
- FR-2: For a starter episode that has not been initialized (empty excerpt), the seed applies
  its starter metadata once: channel, category, excerpt, stats, list-hero flag, and optional
  title, summary and main points.
- FR-3: For an initialized starter episode, the seed only fills listing fields that are empty and
  never changes channel, title or list-hero flag.
- FR-4: A repair script restores each `ui-scroll-demo-<channelId>-NN` episode to channel
  `<channelId>` when that channel exists, and restores the demo excerpt, stats and list-hero flag
  set by the sample script. It is idempotent and touches no other episodes.
- FR-5: The scroll sample script creates 13 demo episodes per active channel.

## Content and compatibility

No schema, slug, route or relationship changes. Episodes created by editors keep their stored
values across restarts. Fresh databases still get starter channels and listing metadata.

## Authorization and data protection

Seeds and scripts use the Payload Local API with `overrideAccess` as existing seeds do; no new
endpoint or permission surface.

## Acceptance criteria

- AC-1: Given demo episodes placed in their slug channels, when the app restarts, then each
  active channel has 13 demo episodes.
- AC-2: Given existing real episodes, when the app restarts, then their channel and
  `updated_at` are unchanged.
- AC-3: Given the repair script has run, when it runs again, then it reports 0 updated.

## Assumptions

- The channel ID embedded in a demo slug is the channel the sample script intended (confirmed by
  the script's slug format `ui-scroll-demo-${channel.id}-NN`).

## Verification constraints

No task-specific test instructions. Verify with lint/type checks of changed files and a restart
against the local Docker database, inspecting rows by SQL.
