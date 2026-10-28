# Plan: Self-hosted Kokoro podcast audio

Project: Unlocked Ventures

## Approach

Replace the ElevenLabs-specific TTS client with a Kokoro client while retaining the current audio
pipeline contract: parse the stored script, synthesize each ordered turn as raw PCM, insert silence,
wrap the result as WAV, upload it to Payload and link it to the episode. Keep the existing voice
field database names for compatibility, but update labels, validation and messages to Kokoro.
Keep the final storage call behind the existing `podcast-audio` upload collection so local disk can
later be replaced by an S3 storage adapter without changing synthesis or dialogue assembly.
Replace the public player's browser `SpeechSynthesis` demo with normal media playback from the
episode's resolved audio URL. The transcript remains editorial/readable content only.
Use the existing episode `meta` field as the formatted duration compatibility field, but make it
read-only and derive it from the attached audio rather than editor input.

## Implementation steps

1. **Pin and deploy the Kokoro service for development.**
   Add a `kokoro` service to `docker-compose.yml` using a tested, pinned Kokoro-FastAPI CPU image
   initially. Use `expose: 8880`, a health check, persistent model/cache storage if required, and
   resource guidance. Make the app depend on service health. Do not publish port 8880 by default.

2. **Add server configuration.**
   Replace ElevenLabs variables in `.env.example` with `KOKORO_BASE_URL`, defaulting in Compose to
   `http://kokoro:8880`. Add optional timeout/model/speed configuration only where it has a real
   operational use. Validate and normalize the base URL server-side.

3. **Create a Kokoro provider adapter.**
   Add `src/pipeline/kokoro.ts` with typed errors, `listKokoroVoices()` and
   `synthesizeKokoroSpeech()`. Call `/v1/audio/voices` and `/v1/audio/speech` using server-side
   `fetch`, `model: kokoro`, selected voice, `response_format: pcm` and bounded timeout/response
   handling. Verify the pinned server returns raw 16-bit mono PCM at 24 kHz; reject unexpected
   content or empty responses.

4. **Make the audio assembler provider-neutral.**
   Remove ElevenLabs constants and messages from `src/pipeline/generate-audio.ts`. Define the
   expected PCM format locally or through a generic synthesis result. Inject the Kokoro synthesizer
   while preserving sequential turns, speaker mapping, 400 ms pauses, WAV creation and filenames.

5. **Wire Kokoro into the protected endpoint.**
   Update `src/pipeline/episode-ai-endpoints.ts` to pass Kokoro URL/model/speed/timeout to the
   generator. Preserve `withEpisodeGenerationLock`, episode read/update checks, audio create checks,
   source/script validation and attachment behavior. Replace provider-specific errors in
   `run-generate-audio.ts` with Kokoro or neutral wording.

6. **Provide protected voice discovery.**
   Add a Payload custom endpoint that lists Kokoro voices only for authenticated editors with the
   relevant episode permissions. The browser must call this endpoint, not Kokoro directly. Return a
   small normalized `{ value, label }` list and sanitized service errors.

7. **Update the admin experience.**
   Change the audio fields in `PodcastEpisodes.ts` to Kokoro wording. Prefer a custom selector or
   autocomplete backed by the protected voice endpoint, with refresh/loading/error behavior and a
   manual value fallback for resilience. Keep `hostVoiceId` and `guestVoiceId` field names. Update
   `generate-audio-field.tsx` validation and messages.

8. **Remove the ElevenLabs runtime integration.**
   Delete `src/pipeline/elevenlabs.ts` after all imports and tests move to Kokoro. Remove
   `ELEVENLABS_API_KEY` and `ELEVENLABS_MODEL_ID` documentation. Confirm no ElevenLabs references
   remain except historical feature records if retained deliberately.

9. **Generate required Payload outputs.**
   Run `pnpm generate:types` if schema metadata changes and `pnpm generate:importmap` if a new admin
   component is registered. Do not hand-edit generated files. Add a canonical numeric duration to
   `podcast-audio` through an additive migration so episode duration can be derived on attachment.

10. **Verify and document rollout.**
    Add provider-adapter and audio-pipeline tests, endpoint authorization/error tests and a live
    Docker smoke check. Benchmark one representative short and full episode on intended hardware.
    Update README setup, operation, voice selection, failure recovery and rollback instructions.

11. **Preserve the future S3 storage boundary.**
    Keep generated buffers flowing through Payload's `podcast-audio` upload collection. Do not write
    to local paths or S3 directly from the Kokoro client. Implement S3 later by configuring the
    collection's storage adapter, followed by a separate migration for existing local files.

12. **Remove browser TTS from the public episode player.**
    Update `src/components/site/podcast/episode-player.tsx` to remove `useTranscriptTts`, its demo
    state, line-based progress and browser-voice status messages. Make `mediaUrl` the only playback
    source while retaining audio/video/embed handling, native duration/progress, seeking, keyboard
    controls and errors. Keep transcript rendering elsewhere unchanged. Delete
    `src/components/site/podcast/use-transcript-tts.ts` after confirming it has no other consumers.

13. **Verify public playback with generated audio.**
    Cover the precedence regression: an episode with both transcript and `mediaUrl` must play the
    stored file. Verify no Web Speech API call occurs, missing audio does not synthesize text, and
    local plus representative S3/CDN URLs work through the same player path.

14. **Calculate generated-audio duration at assembly time.**
    Extend the successful audio-generation result with `durationSeconds`. For the current PCM path,
    calculate it from final PCM byte/sample count after dialogue pauses are inserted. Pass the value
    through `run-generate-audio.ts` to `attachGeneratedAudioToEpisode`, format it as `M:SS` or
    `H:MM:SS`, and update the episode's existing `meta` field in the same attachment operation.

15. **Extract duration for manual uploads.**
    Add one server-side audio-metadata helper used while the upload buffer is available. Integrate it
    with the existing direct-upload/episode attachment flow so supported MP3, WAV, M4A and other
    accepted formats update `meta` after attachment. Do not rely on a browser-supplied duration.
    Direct remote files may be inspected only through bounded server-side fetches; YouTube/Vimeo
    platform-page duration remains out of scope until a provider/API policy is chosen.

16. **Make Duration derived and preserve consumers.**
    Change the `meta` field label/description to explain that it comes from audio and make it
    read-only. Preserve its string shape because existing cards, listings and episode details consume
    it. Regeneration/replacement updates it; removal clears it to the existing empty placeholder.
    Store canonical seconds on `podcast-audio` and keep `meta` as the formatted compatibility field.

17. **Stage generated audio before publication.**
    Store the newly generated upload in server-owned pending fields and expose it as an admin
    preview. Provide Save Generated Audio and Regenerate Audio actions. Only the save endpoint may
    promote the pending relationship, URL and duration to the episode's public audio fields; until
    then the previous public audio remains unchanged.

## Affected files and design

| Area             | Proposed change and paths                                                    |
| ---------------- | ---------------------------------------------------------------------------- |
| CMS/admin        | `PodcastEpisodes.ts`, audio field component, optional Kokoro voice selector  |
| Server/access    | `episode-ai-endpoints.ts`, existing RBAC and generation lock retained        |
| Audio pipeline   | new `kokoro.ts`; provider-neutral `generate-audio.ts`; updated runner        |
| Audio storage    | retain `PodcastAudio` upload boundary; prepare a separate future S3 rollout  |
| Public playback  | remove browser TTS; make stored `mediaUrl` authoritative                     |
| Infrastructure   | `docker-compose.yml`, `.env.example`, pinned Kokoro service and health check |
| Generated output | Payload types/import map only when their source inputs change                |
| Documentation    | root README and this unit's five feature records                             |

## Content compatibility and rollout

No destructive seed or database rewrite is required. An additive nullable `duration_seconds` column
is introduced for audio records. Existing voice strings remain stored, but old
ElevenLabs IDs are not valid Kokoro voices. Deployment must start and health-check Kokoro before the
application enables audio generation. Editors select approved Kokoro voices on the next generation.
Existing audio remains linked and playable.

### Future S3 rollout

In a separate feature, configure Payload's S3 storage adapter for the `podcast-audio` collection.
The bucket stores the audio object; PostgreSQL stores the Payload upload document, object metadata,
resolved URL and episode relationship. Application consumers continue reading the related audio
URL. The rollout must define IAM permissions, private/public or signed-URL policy, CORS if required,
object naming, retention, deletion behavior, CDN/custom domain and migration of existing local
audio. Do not store full audio blobs in PostgreSQL or construct S3 URLs in the Kokoro pipeline.
If signed URLs are used, the loader/player integration must refresh or resolve them at request time
rather than persisting an expiring URL as durable episode content.

## Failure handling and recovery

- Service unavailable/timeout/invalid response: mark the audio job `error`, release the generation
  lease and retain prior content/audio.
- Invalid voice: return a clear sanitized validation error and reload available voices.
- Browser request timeout: retain current polling behavior because server generation may continue.
- Rollback: restore the prior application configuration and ElevenLabs credentials if the old code
  is redeployed. No database rollback is required because stored fields are unchanged.

## Verification strategy

- Unit/integration test Kokoro request bodies, response validation, error sanitization, voice mapping,
  PCM concatenation, pauses and WAV headers using mocked `fetch`/synthesizers.
- Test protected voice discovery and generation permission boundaries.
- Test that calculated duration includes inserted pauses, formats hour-long files correctly and
  updates when generated/uploaded audio is replaced or removed.
- Test that transcript presence no longer switches playback to browser TTS and that `mediaUrl`
  remains the source for native playback, progress and seeking.
- Run `pnpm lint`, `pnpm exec tsc --noEmit` and focused Vitest suites.
- Run generation against the pinned local Kokoro container, inspect/play the produced WAV and verify
  Payload attachment on a disposable episode.
- Benchmark short and representative full scripts; record hardware, duration and peak resource use.

## Operations impact

Operators own a new model-serving container and its compute, health, logs and upgrades. Production
must pin an image version, keep the API private, monitor generation latency/failures and provision
enough CPU/RAM or GPU capacity. Deployment is outside this plan until explicitly authorized.
The later S3 rollout additionally requires an AWS bucket, least-privilege IAM configuration,
storage lifecycle/retention policy and a decision on public URLs versus signed delivery.

## Related decisions and unresolved questions

- Existing architecture: `aidlc/aidlc-docs/adr/0001-project-architecture.md`
- Decide CPU/GPU capacity, approved voices and pinned image before production rollout.
- Decide S3 account/bucket/region, URL access policy, retention and local-file migration in a
  separate storage feature before enabling S3.
- If future throughput requires concurrent jobs, design a queue and worker model separately rather
  than adding uncontrolled parallel requests to the web process.
