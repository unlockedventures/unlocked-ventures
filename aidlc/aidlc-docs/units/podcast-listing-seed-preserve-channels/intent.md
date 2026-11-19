# Intent: Podcast listing seed preserves episode channels

Project: Unlocked Ventures

- Status: done
- Gate status: not applicable
- Ticket or issue: none
- Owner: not specified

## Business goal

The podcast listing startup seed rewrote every episode's channel, category, excerpt, stats and
list-hero flag on each application start. Episodes whose slug the seed did not recognise were
moved to "Digital engineering", leaving "General" empty and discarding editor channel choices.
This also prevented the `frontend-demo` mock export from capturing 13 UI scroll demo episodes
per channel. Startup must stop overwriting saved episode data, and the misplaced demo episodes
must be returned to their intended channels.

## Users and stakeholders

Content editors managing podcast episodes, and maintainers preparing the client demo snapshot.

## Scope

- Included: make `seedPodcastListing` episode defaults initialize-once/fill-empty; a repeatable
  script that restores `ui-scroll-demo-<channelId>-NN` episodes to the channel in their slug and
  their original demo excerpt/stats; the scroll sample script producing 13 episodes per channel.
- Excluded: recovering editor channel choices for real episodes (prior values are not stored),
  the unrelated `success-stories` seed validation failure, `frontend-demo` mock export, push or
  deployment.

## Affected areas

- `src/data/seed-podcast-listing.ts` (startup seed in `src/payload.config.ts`).
- `scripts/add-podcast-scroll-samples.mts`, new `scripts/repair-podcast-scroll-sample-channels.mts`.
- `podcast-episodes` rows in the local Docker PostgreSQL volume.

## Constraints

Preserve persisted editor content, slugs, routes and relationships. No schema change. Fresh
databases must still receive the existing starter episode metadata.

## Success criteria

- After an application restart, every active channel, including General, lists 13 demo episodes.
- Restarting does not change channels or listing fields of existing episodes.

## Risks and open questions

- Real episodes' channels were already reset by earlier starts; their editor-chosen values cannot
  be recovered from the database.
- A known starter episode whose excerpt an editor clears is treated as uninitialized and receives
  the seed defaults again on the next start.
