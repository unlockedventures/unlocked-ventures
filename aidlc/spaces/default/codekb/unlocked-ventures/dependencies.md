# Dependencies

## External Boundaries
Payload UI/form state supplies admin fields and permission visibility. Payload server APIs persist episodes through PostgreSQL. Transcription adapters use TRANSCRIBER_URL/TRANSCRIBER_SECRET; script adapter uses Gemini configuration; audio adapter uses ElevenLabs configuration. Only configuration variable names were inspected; no secret values were read.

## Internal Relationships
PodcastEpisodes imports episodeAiEndpoints, applyAiContentToEpisode and thumbnail/video helpers. Generation UI components depend on matching button-state and parsing helpers. Endpoints call transcript/script/audio handlers, save through Payload, and bypass automatic AI content sync only for scoped pipeline writes. See component-inventory.md for responsibilities and api-documentation.md for contracts. Regrouping fields should preserve these dependencies.
