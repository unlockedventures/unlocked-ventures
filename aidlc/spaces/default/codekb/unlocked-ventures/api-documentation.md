# API Documentation

## Inspected Episode APIs
All paths below are under /api/podcast-episodes. Custom generation endpoints require a signed-in user and server-checked episode Read/Update permissions; audio additionally requires Podcast audio Create. Local API calls pass req and overrideAccess:false.

| Method/path | Input | Behavior |
| --- | --- | --- |
| POST /transcribe | id, optional videoLinks URL rows | Calls transcription handler, persists sourceTranscript/status/video progress; does not invoke script generation |
| GET /progress | None | Proxies transcriber progress; unavailable service returns percent 0 |
| POST /generate-script | id, hostGender, guestGender | Reads saved sourceTranscript; persists scriptJson, summary, mainPoints, contrastingPoints, disagreementPoints, systemOpinion and script status |
| POST /generate-audio | id, hostVoiceId, guestVoiceId | Reads stored script/opinion; generates and attaches episode audio |
| GET /:id?depth=0 | Episode ID | Existing document read used for polling |

## Failure and Compatibility Contracts
Unauthenticated calls return 401; missing permissions return 403. Missing IDs/documents fail. Script handler rejects empty transcript/missing genders with 400 and concurrent jobs with 409. Provider script failure is persisted as scriptStatus:error and returned with HTTP 200. UI label UV takes must retain systemOpinion in requests, persistence, mapping and selector references. No route or schema change is needed for section ordering.
