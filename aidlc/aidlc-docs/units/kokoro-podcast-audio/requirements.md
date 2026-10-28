# Requirements: Self-hosted Kokoro podcast audio

Project: Unlocked Ventures

## Functional requirements

- FR-1: The application shall synthesize each valid host/guest script turn through the configured
  self-hosted Kokoro service.
- FR-2: The host and guest shall use independently selected Kokoro voices.
- FR-3: The application shall retain dialogue order, insert the configured pause between turns and
  produce one playable podcast audio file.
- FR-4: Successful audio shall be created through the `podcast-audio` Payload upload collection and
  linked to the episode using the existing upload audio source behavior.
- FR-5: The admin UI shall identify the fields as Kokoro voices, load each field as a dropdown from
  the protected Kokoro voice catalog, and prevent generation until both voices, a valid script and
  the existing required episode content are present.
- FR-6: Editors shall receive sanitized errors for unavailable service, invalid voice, timeout and
  invalid audio responses.
- FR-7: The existing episode generation lock and audio job states shall continue preventing
  conflicting generation work.
- FR-8: Audio generation shall not depend on a local filesystem path. A future Payload S3 storage
  adapter must be able to write the same generated buffer to S3 while the database stores the
  `podcast-audio` record and its resolved object URL/reference.
- FR-9: The public episode player shall use the resolved `mediaUrl` for generated or uploaded audio
  and shall not call the Web Speech API or synthesize transcript text in the visitor's browser.
- FR-10: Transcript content shall remain available for reading and shall not override, replace or
  take playback priority over the stored episode audio.
- FR-11: An episode without a valid stored media URL shall show the existing no-audio/error state;
  it shall not silently fall back to browser TTS.
- FR-12: When Kokoro-generated audio is attached, the application shall calculate its duration from
  the final audio samples and write the formatted value to the existing episode `meta` field.
- FR-13: When an editor uploads a supported audio file, the application shall extract its duration
  server-side and update the same episode duration field after attachment.
- FR-14: The Duration field shall be read-only in the episode editor. Regenerating or replacing
  audio shall replace the old duration; removing audio shall clear it to the established empty
  display value.
- FR-15: Duration shall be formatted consistently as `M:SS`, or `H:MM:SS` for audio at least one
  hour long, and remain compatible with existing `meta` consumers.
- FR-16: While audio is being generated, the episode editor shall show persisted turn-based
  percentage progress that remains visible through the existing polling flow.
- FR-17: After generation completes, the episode editor shall show an inline player for the newly
  attached audio so the editor can listen without leaving the episode form.
- FR-18: Generated audio shall remain a pending preview and must not replace the public episode
  audio until an authorized editor selects Save Generated Audio.
- FR-19: A pending preview shall provide Save Generated Audio and Regenerate Audio actions. Saving
  shall atomically promote the preview; regenerating shall leave the previously published audio in
  place until the replacement preview is explicitly saved.
- FR-20: While generation is processing, an authorized editor shall be able to stop it. Stopping
  shall abort the active Kokoro request, prevent remaining turns from running, preserve the public
  audio and preserve any previously completed preview.
- FR-21: On the public episode page, clicking or keyboard-activating the episode artwork/player
  surface shall toggle stored audio play and pause. Dedicated buttons and the seek control shall
  retain their own behavior without causing a second toggle.
- FR-22: The public native audio/video player shall offer 0.75×, 1×, 1.25×, 1.5× and 2× playback
  speeds and a fullscreen toggle for the whole player. Embedded providers retain native controls.
- FR-23: A play or pause action from the artwork surface, explicit control or keyboard shall show a
  large, centered, transient visual indicator over the thumbnail without intercepting input.
- FR-24: Clicking, dragging or keyboard-operating the public progress bar shall seek native media
  without toggling playback, including browsers where pointer capture is unavailable or media
  metadata duration arrives late. The saved episode duration shall provide the initial fallback.

## Content and compatibility

Retain `hostVoiceId` and `guestVoiceId` as stored field names to avoid an unnecessary schema
migration. Their values become Kokoro voice names after the cutover. Existing ElevenLabs voice IDs
may remain stored but must be replaced by an editor before a new Kokoro generation succeeds.
Previously generated audio and episode relationships remain unchanged.

The initial Kokoro cutover may continue using local upload storage. Future S3 adoption shall be an
additive infrastructure/configuration change to `PodcastAudio`, not a rewrite of the TTS pipeline.
The database remains the source of metadata and relationships; the S3 bucket stores audio bytes.
Consumers shall use Payload's resolved audio URL rather than constructing bucket URLs from keys.

## Authorization and data protection

- Require authenticated `podcast-episodes` read/update permission and `podcast-audio` create
  permission through the existing endpoint and Payload Local API boundaries.
- Keep the Kokoro base URL and any optional service token server-side.
- Keep AWS credentials, bucket name, region and endpoint configuration server-side. Use workload
  identity/IAM roles in hosted environments where available rather than persisted access keys.
- Do not publish the Kokoro container port in the default Compose configuration.
- Bound response size and request duration, and return sanitized provider errors to editors.

## Quality requirements

- Generated PCM must be verified as signed 16-bit, mono and 24 kHz before using the existing WAV
  assembly path, or the implementation must parse/normalize the returned audio.
- A synthesis timeout must release the existing generation lease and set the audio job to error.
- The implementation must avoid unbounded parallel synthesis that could exhaust the self-hosted
  service. Sequential generation is acceptable for the initial cutover.
- Voice and pronunciation quality must be reviewed with representative host/guest scripts.
- Playback controls, duration, seeking, keyboard behavior and error messaging must continue working
  with local and future S3/CDN audio URLs.
- Duration extraction must occur before or while the upload buffer is available; it must not depend
  on a public S3 URL or browser metadata after storage.
- Failure to extract duration must not corrupt or discard valid audio. It shall leave a clear empty
  duration value and record a sanitized operational error.

## Acceptance criteria

- AC-1: Given an authorized editor, current script, required episode content and two valid Kokoro
  voices, when audio generation completes, then a playable WAV is attached to the episode.
- AC-2: Given host and guest turns, when generation completes, then turn order, voice assignment and
  inter-turn pauses match the script.
- AC-3: Given Kokoro is unavailable or returns invalid audio, when generation is attempted, then the
  job becomes `error`, a sanitized message is shown, and saved script/previous audio remain intact.
- AC-4: Given an unauthorized user, when the generation or voice-list endpoint is requested, then
  server-side access is denied.
- AC-5: Given an existing ElevenLabs voice ID, when Kokoro rejects it, then the editor is prompted to
  choose a valid Kokoro voice rather than silently falling back.
- AC-6: After cutover, no runtime code requires `ELEVENLABS_API_KEY` or calls ElevenLabs.
- AC-7: Given local storage is later replaced by the configured S3 adapter, when Kokoro audio is
  generated, then the object is stored in S3, the Payload audio document contains the resolved
  URL/reference, and episode playback requires no TTS pipeline changes.
- AC-8: Given an episode has both transcript lines and a stored audio URL, when a visitor presses
  play, then the player streams the stored audio and never invokes `window.speechSynthesis`.
- AC-9: Given an episode has transcript lines but no stored audio URL, when displayed, then the
  transcript remains readable and the player reports that no audio is linked.
- AC-10: Given generated audio with a known sample count, when it is attached, then the episode
  Duration equals the final audio length including inserted pauses.
- AC-11: Given a supported uploaded audio file, when it is attached or replaced, then Duration is
  extracted and updated without editor input.
- AC-12: Given an audio duration over one hour, when saved, then it is displayed as `H:MM:SS` on the
  admin form, cards/listings and episode details.
- AC-13: Given an episode already has published audio, when a new preview is generated or
  regenerated, then public listeners continue hearing the old audio until Save Generated Audio.
- AC-14: Given a pending preview, when an authorized editor saves it, then the preview audio and
  duration become the episode's stored public values and the pending state is cleared.
- AC-15: Given audio generation is active, when Stop Generating Audio is selected, then synthesis
  terminates with a stopped status and no generated audio is promoted to the public episode.
- AC-16: Given a playable stored audio URL, when a visitor clicks the episode artwork twice, then
  the first click plays and the second pauses; seeking and the explicit play button still work once.
- AC-17: Given native stored media, when a visitor selects a speed, then media playbackRate changes;
  when fullscreen is selected, the complete episode player enters browser fullscreen mode.
- AC-18: Given playable stored media, when playback is toggled, then the matching centered play or
  pause indicator appears briefly and disappears without blocking subsequent interaction.
- AC-19: Given media with known duration, when the visitor clicks halfway across the progress bar,
  then playback currentTime moves to approximately half the duration.

## Open questions

| ID  | Question                                                                        | Answer or evidence                                                                                                                         | Status |
| --- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| Q1  | CPU or GPU in production?                                                       | Decide from representative episode benchmark on target infrastructure.                                                                     | Open   |
| Q2  | Which voices are approved for host and guest defaults?                          | Editorial review is required after service deployment.                                                                                     | Open   |
| Q3  | What image release will be pinned?                                              | Kokoro-FastAPI CPU `v0.9.0` is pinned and passed the local health, voice-list and PCM synthesis smoke checks.                              | Closed |
| Q4  | Which AWS account, bucket, region, URL policy and retention rules will be used? | Decide during the separate S3 rollout; no values are assumed in the Kokoro cutover.                                                        | Open   |
| Q5  | Should platform-page URLs such as YouTube/Vimeo receive automatic duration?     | Initial scope covers generated/uploaded audio and directly inspectable files; platform metadata requires a separate provider/API decision. | Open   |

## Assumptions

- Kokoro-FastAPI's OpenAI-compatible `/v1/audio/speech` and `/v1/audio/voices` endpoints are used;
  the pinned version returned 16-bit 24 kHz PCM and 72 voices in the local smoke test.
- Initial integration will generate one turn at a time and reuse the existing WAV assembler because
  this is the smallest change to the current provider boundary.

## Verification constraints

This feature is not covered by the homepage menu-source no-automated-tests preference. Unit and
integration tests are appropriate. A live Kokoro smoke test requires its Docker image/model and
sufficient local compute.
