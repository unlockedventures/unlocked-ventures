# Reverse Engineering Timestamp

## Run Record
- Date: 2026-10-23
- Commit: 8f2e9d72c7fa6efb5a4719ed5a703569df716606
- Focused first scan at Minimal depth; observed baseline only.

## Scope of Analysis
```yaml
scope_version: 1
kind: partial
intent: 261023-episode-form-order
fingerprint: 7e28f7f10088d9c28275d75d61bdde85ba9f3bcd
analyzed:
  paths:
    - src/collections/PodcastEpisodes.ts
    - src/components/admin/generate-transcript-field.tsx
    - src/components/admin/generate-script-field.tsx
    - src/components/admin/generate-podcast-skeleton.css
    - src/components/admin/generate-audio-field.tsx
    - src/pipeline/episode-ai-endpoints.ts
    - src/pipeline/apply-ai-content.ts
    - src/pipeline/run-generate-script.ts
    - src/pipeline/script-button-state.ts
    - tests/int/episode-picture-fields.int.spec.ts
    - tests/int/episode-editor-mode.int.spec.tsx
    - tests/int/pipeline-script-button.int.spec.ts
    - tests/int/pipeline-audio-button.int.spec.ts
    - tests/int/transcript-save-links.int.spec.tsx
    - tests/e2e/episode-create-mode.e2e.spec.ts
    - package.json
    - README.md
  components:
    - PodcastEpisodes
    - GenerateTranscriptField
    - GenerateScriptField
    - GenerateAudioField
    - EpisodeAiEndpoints
    - ApplyAiContentToEpisode
shallow:
  paths:
    - src/
    - tests/
```
