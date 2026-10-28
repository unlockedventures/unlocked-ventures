# Intent: Self-hosted Kokoro podcast audio

Project: Unlocked Ventures

- Status: done
- Ticket or issue: Not provided
- Owner: Not assigned

## Business goal

Replace ElevenLabs in the AI episode audio step with a self-hosted Kokoro text-to-speech service.
Editors should continue generating host-and-guest podcast audio from the saved AI script in the
Payload admin portal, while the application controls the TTS infrastructure and no longer requires
an ElevenLabs API key.

## Users and stakeholders

- Content editors who create AI podcast episodes.
- Administrators who configure host and guest voices.
- Operators who run the application, PostgreSQL, transcriber and Kokoro services.

## Scope

- Included: a self-hosted Kokoro service, server-side Kokoro client, host/guest voice selection,
  audio generation, storage through the Payload `podcast-audio` collection, configuration,
  public episode playback, configuration, documentation and verification. The design must remain
  compatible with future S3-backed storage.
- Excluded: changing transcript, source-summary or script generation; voice cloning; replacing
  previously generated audio; public access to the Kokoro API; production hosting selection;
  implementing the future S3 rollout as part of the initial Kokoro cutover.

## Affected areas

- `docker-compose.yml` and `.env.example`
- `src/pipeline/elevenlabs.ts`, `generate-audio.ts`, `run-generate-audio.ts` and
  `episode-ai-endpoints.ts`
- `src/components/admin/generate-audio-field.tsx`
- `src/components/site/podcast/episode-player.tsx` and the browser TTS hook it currently uses
- `src/collections/PodcastEpisodes.ts`
- Generated Payload types and admin import map if their inputs change
- Audio pipeline tests and the root README

## Constraints

- Preserve existing episode records, uploaded/generated audio, generation status, permissions and
  database generation leases.
- Keep audio creation behind the `podcast-audio` Payload upload collection so its storage adapter can
  move from local disk to S3 without changing the Kokoro synthesizer or episode-generation flow.
- Keep Kokoro reachable only by the server in the Docker network unless operators explicitly
  configure otherwise.
- Do not send credentials or provider details to the browser.
- Use an output format with a verified sample rate and encoding before concatenating dialogue turns.
- Pin and test a Kokoro service image version before production rollout.

## Success criteria

- An authorized editor can select distinct Kokoro voices and generate a playable podcast file.
- The generated file attaches to the linked episode through the existing `podcast-audio` collection.
- The public episode player plays the episode's stored audio URL and does not synthesize transcript
  lines through the visitor's browser.
- The episode Duration field is populated from the actual attached audio length and is reused by
  cards, listings and episode details without manual entry.
- A later S3 adapter can store the binary in a bucket while Payload/PostgreSQL retains the audio
  document, object metadata and usable URL/reference for the episode.
- Missing service, invalid voice and synthesis failures produce useful admin errors without losing
  the saved script or previous audio.
- ElevenLabs configuration and runtime calls are no longer needed after cutover.

## Risks and open questions

- CPU generation time for full episodes must be benchmarked on the target host; GPU may be needed.
- Final production compute and resource limits remain deployment decisions. The development image is
  pinned to Kokoro-FastAPI `v0.9.0`.
- English voice choices and pronunciation quality must be accepted using representative UV scripts.
