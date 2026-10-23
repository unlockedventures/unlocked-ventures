# Episode Creation Form Requirements

Status: Proposed; awaiting requirements approval. Observed implementation is a baseline, not retrospective approval.

## Sources
- [desc] Initial description: authoritative request in project-description.json, supplemented by the user's original section list and screenshot in this conversation.
- [Q1] User clarification: required host/guest genders before Generate Podcast Script; separate following audio section with required host/guest ElevenLabs voice IDs before Generate Podcast Audio.
- [Q2] User clarification: full layout for AI episodes; match shared order in manual episodes wherever practical.
- [Q3] User selected generation-time requirements, with incomplete drafts allowed.
- Repository AGENTS.md: preserve persisted contracts, editor content, authorization, and traceable verification.
- Observed baseline: ../reverse-engineering/developer-scan.md and space CodeKB; informs compatibility only.

## Intent Analysis
Editors need the episode form to follow the creation sequence from episode identity and picture through video transcription, podcast content, audio, and metadata. The main actor is an authorized episode editor. The intended outcome is a clear order and independent generation steps without loss of saved episode content.

## Functional Requirements
All requirements are Must priority. Acceptance criteria are proposed until this document is approved.

### FR1: AI form order [desc, Q1]
The AI episode create and edit form shall present its main content in this order:
1. Title.
2. Channel selection.
3. Picture section, preserving its existing input choices.
4. Create with AI: video links, transcript action and source transcript only.
5. Generate podcast: required host gender and guest gender before Generate Podcast Script; output fields ordered Summary, script.json, Main points, Contrasting points, Disagreement points, UV takes.
6. Audio generation: required host ElevenLabs voice ID and guest ElevenLabs voice ID before Generate Podcast Audio.
7. Guest, topic and duration.
8. Featured.

- AC1.1: Given a new or existing AI episode, when the editor opens it, then the main sections and fields appear in the order above; job/status sidebar fields retain their current purpose.
- AC1.2: Given a saved AI episode with values, when sections are reorganized and the editor saves and reopens it, then all values remain associated with the same fields.

### FR2: Independent transcript generation [desc]
Create with AI shall initiate transcription of video links only. Podcast script and audio shall remain separate explicit actions.

- AC2.1: Given valid saved video links, when Generate Transcript is selected, then the transcription request runs without starting script or audio generation.
- AC2.2: Given invalid or unavailable video input, when transcription is attempted, then existing validation/error feedback remains available and no downstream generation starts.

### FR3: Podcast section and terminology [desc, Q1]
Generate podcast shall group the existing content generation controls and requested outputs. Rename the editor-facing opinion label and related generation guidance to UV takes, preserving the stored systemOpinion field and generation contracts.

- AC3.1: Given a completed script generation, when its results are displayed, then Summary, script.json, Main points, Contrasting points, Disagreement points and UV takes remain editable through their existing field contracts.
- AC3.2: Given existing systemOpinion content, when the form opens, then its value appears under UV takes without migration or content replacement.

### FR4: Required generation inputs [Q1, Q3]
Both gender selections shall be required for script generation, and both nonblank ElevenLabs voice IDs shall be required for audio generation. Required indicators and guidance shall make the action-specific requirement clear. These inputs shall not become unconditional collection-level save requirements.

- AC4.1: Given either gender is missing, when script generation is requested, then generation does not start and the missing-input requirement is communicated; with both supplied, the action follows existing prerequisite checks.
- AC4.2: Given either voice ID is missing or whitespace-only, when audio generation is requested, then generation does not start and the missing-input requirement is communicated; with both supplied, the action follows existing script/provider prerequisite checks.
- AC4.3: Given genders and voice IDs are empty but existing draft prerequisites are met, when the editor saves a draft or video links, then saving remains possible.
- AC4.4: Given a generation provider fails, when the failure is returned, then existing error feedback and retry behavior remain available without falsely reporting completion.

### FR5: Manual mode compatibility [Q2]
Manual episodes shall match the shared order Title, Channel, Picture, editorial content, Guest/topic/duration, Featured wherever practical while retaining their existing manual input controls. AI-only transcript, script and audio generation sections shall remain absent in manual mode. Document any necessary divergence in implementation evidence.

- AC5.1: Given manual mode, when the editor opens the form, then shared fields follow that relative order and manual content remains editable without AI inputs.
- AC5.2: Given an existing manual episode, when it is saved and reopened, then its content, picture selection and mode remain intact.

## Non-Functional Requirements
- NFR1 — Compatibility/security: preserve collection slug, persisted field names/types, relationships, routes, generation authorization and public visibility rules. No new access rights. AC6.1: existing unauthorized-generation tests continue to deny access; field contract checks show no storage rename or required draft inputs introduced.
- NFR2 — Accessibility/responsiveness: preserve Payload field labels, keyboard focus/navigation and existing responsive form layout. AC6.2: controls retain accessible names and readable required guidance; browser checks confirm section order and no new horizontal overflow at supported desktop/mobile viewports where the environment permits.
- NFR3 — Performance/reliability: reorganization shall introduce no new generation requests, polling loops or provider calls. AC6.3: component/network checks demonstrate actions remain explicitly initiated and existing polling behavior is retained.

## Interfaces and Persistence
Affected surfaces: PodcastEpisodes collection metadata, custom transcript/script/audio field guidance and prerequisite handling, related loading selectors and regression tests. Existing flat fields (including summary, mainPoints, scriptJson, contrastingPoints, disagreementPoints, systemOpinion, hostGender, guestGender, hostVoiceId, guestVoiceId) remain authoritative. Reuse unnamed presentation groups; no data migration is intended. Preserve AI/manual conditions, picture validation and draft/publication boundaries.

## Constraints
Use strict TypeScript, existing Payload/React patterns and project formatting. Avoid duplicate definitions of shared fields. Generate Payload types/import map using documented commands if their inputs change. Do not run seeds or backfills to implement this UI change. Apply SOLID, KISS, DRY and YAGNI to changed code.

## Verification and Traceability
The implementation plan must map FR1–FR5 and NFR1–NFR3 with AC1.1–AC6.3 to changed paths and named tests or explicit manual evidence. Establish a pre-change test baseline, run relevant metadata/component/pipeline/browser regressions, lint, type checks and build; report unavailable database/browser prerequisites and pre-existing failures separately. No checks have run at this requirements stage. No completed verification is claimed.

## Assumptions & Open Questions
None. The numbered UI order incorporates the explicitly requested separate audio section before metadata. Generation-time requirements and manual scope were resolved in Q1–Q3.

## Out of Scope
New AI providers, prompt/output redesign, transcript/script/audio algorithms, new publishing rules, data migrations, public-site terminology redesign, unrelated authorization changes, deployment and general refactoring.
