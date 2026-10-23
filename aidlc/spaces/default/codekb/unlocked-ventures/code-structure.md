# Code Structure

## Focused Module Organization
- src/collections/PodcastEpisodes.ts: collection fields, presentation order, mode conditions, hooks and endpoint attachment.
- src/components/admin/: transcript/script/audio controls and loading CSS.
- src/pipeline/: endpoint adapters, generation handlers, button guards and AI-to-public-content mapping.
- tests/int/: collection metadata, component and pipeline regression tests.
- tests/e2e/episode-create-mode.e2e.spec.ts: authenticated AI/manual creation browser checks.

## Patterns and Constraints
Payload unnamed collapsibles preserve flat field paths. UI components dispatch field updates by names such as summary, scriptJson and systemOpinion. Image inputs depend on imageSource; AI/manual conditions depend on editorMode. Reordering must retain these contracts. See component-inventory.md and code-quality-assessment.md.
