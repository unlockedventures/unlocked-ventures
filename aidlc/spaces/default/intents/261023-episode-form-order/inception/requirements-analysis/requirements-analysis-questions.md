# Requirements Analysis Questions

## Sources
- [desc] Initial description: seven-section ordering requested in chat; Create with AI generates transcripts only; opinion display label becomes UV takes.
- Observed implementation: ../reverse-engineering/developer-scan.md and the space CodeKB. Observations are not approved requirements.

## Q1: Existing generation controls
Script generation currently requires host/guest gender selections. Voice IDs and Generate Podcast Audio are also present. Where should these controls appear?

A. Keep gender, voice IDs, and audio generation within Generate podcast, alongside its existing generation button and the requested outputs.
B. Keep gender in Generate podcast, but put voice IDs and audio generation in a separate audio subsection within it.
X. Other (please specify)

[Answer]: X. Other: Host and guest gender selections must appear before Generate Podcast Script and both are required. A separate audio generation section follows the podcast script section; host and guest ElevenLabs voice IDs must appear before Generate Podcast Audio and both are required. Source: user clarification in chat.

## Q2: AI and manual editor scope
The requested order is for Create with AI. Manual editing shares some field definitions.

A. Apply the seven-section layout to AI-created episodes on create and edit; preserve the manual editing workflow and its current layout where practical.
B. Apply the shared field ordering to both AI and manual editing; show AI generation sections only for AI episodes.
X. Other (please specify)

[Answer]: A. AI episodes only, but match the order of shared fields in manual episodes wherever practical. Source: user clarification in chat.

## Q3: Required generation inputs and draft saving
Gender and voice IDs are entered at different steps of AI creation. Should their required status apply to generation actions or all saves?

A. Require both genders to generate a script and both voice IDs to generate audio; allow saving a draft before these inputs are filled.
B. Require all four inputs for every AI episode save, including draft saves before transcription.
X. Other (please specify)

[Answer]: A. Require both genders to generate a script and both voice IDs to generate audio; allow saving a draft before these inputs are filled. Source: user selected option 1 in chat.

## Q4: Combined transcript summary action
The user requested an additional layer summarizing all source transcripts from all videos, with podcast generation based on that summary. The user confirmed it belongs to the active work. Current implementation sends source transcript directly to script generation; this new layer has not been implemented.

How should the intermediate summary be generated?

A. A separate Generate source summary button and editable summary section between transcription and Generate podcast. Podcast generation requires a current source summary.
B. Automatically summarize all transcripts when Generate Podcast Script is selected, then generate podcast content from that summary in the same action.
X. Other (please specify)

[Answer]: A. Separate Generate source summary button and editable summary section between transcription and Generate podcast. Podcast generation requires a current source summary. Source: user selected option 1 in chat.
