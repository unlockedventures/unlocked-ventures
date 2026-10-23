# Component Inventory

## PodcastEpisodes
Defines episode collection and all requested form sections. Depends on thumbnail validation, video resource reconciliation, AI mapping and custom endpoints. Existing order: Channel, Title, combined AI controls, Featured, Guest/topic/duration, Picture, manual content, About this episode, other manual blocks and SEO. Sidebar fields interleave in the configuration but render separately.

## GenerateTranscriptField
Provides Save video links and Generate Transcript. Requires saved ID for generation, sends current links, polls transcript and video status. Depends on Payload form/auth hooks and transcript button/progress helpers.

## GenerateScriptField
Requires saved ID, transcript and host/guest genders. Generates and synchronizes script plus editorial outputs; toggles transcription loading CSS. Depends on scriptButtonState and script schema validation.

## GenerateAudioField
Requires saved ID, valid script, opinion and voice IDs. Uses stored script and sends current voice IDs to audio endpoint. Depends on audio button state, script parsing and Payload permissions.

## EpisodeAiEndpoints
Four server adapters described in api-documentation.md; enforce permissions and call provider-backed handlers with persisted episode data.

## ApplyAiContentToEpisode
Maps summary to about, contrasting/disagreement points to agree/disagree, systemOpinion to takeIntro, script/source transcript to public transcript and generated duration to meta. Public content contracts must remain stable.
