# Sample episodes for manual browsing

## User request and scope
User requested test podcasts to manually try the floating channel pill. Add 12 clearly labeled DEMO episodes per active channel on the local configured database. They are Complete so visible on the podcast listing, manual mode, not featured and not hero content. Reuse existing thumbnails; do not fabricate recordings or run AI providers. Slugs use ui-scroll-demo-<channel-id>-<number> for identification and idempotency.

## Approach and limits
scripts/add-podcast-scroll-samples.mts disables config.onInit so existing general seeds/backfills do not run. It creates only missing sample slugs and never updates existing episodes. Execute with PAYLOAD_DB_PUSH=false through the local Docker app environment. No schema push, seeds, migrations, test suite or provider request is authorized as part of this fixture addition. This sample content appears on the local public listing; other deployments are not changed. Execution outcome follows below.

## Execution outcome
The local Docker command completed successfully: 60 episodes created, zero skipped, across General podcast, Future, Digital engineering, Communication and Artificial intelligence (AI). No application test suite ran. Existing episodes were not updated by this script. Refresh the podcast page, choose a channel, scroll down and use See more to expose additional cards.
