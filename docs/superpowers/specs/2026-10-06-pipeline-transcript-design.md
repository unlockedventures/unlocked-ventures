# Pipeline transcript design

Editors create a Pipeline document, paste one or more public video links, and click Generate Transcript. The admin app sends each link to a private transcriber service. That service downloads audio with yt-dlp, converts it with ffmpeg, transcribes it with local Whisper `turbo`, deletes the local media, and returns text. The app writes that text into the transcript field.

## Decisions

- Whisper model is `turbo`. The task is transcription in the spoken language. Language is detected from the audio. This flow does not translate speech into English.
- Video length is mixed. The screen shows a working state. Each video is stopped at 30 minutes.
- Downloaded video and extracted audio live only in a temp directory, and that directory is deleted after success, failure, and timeout.
- The Next.js app and the transcriber are separate Docker services. The website container does not run Whisper.
- The transcriber handles one video at a time.

## Architecture

```
Pipeline screen
  → Generate Transcript
  → Next.js route (logged-in editors only)
  → transcriber service (Docker, private network)
       yt-dlp downloads audio
       ffmpeg converts it to 16 kHz mono wav
       Whisper turbo writes the text
       temp files are deleted
  → transcript field on the Pipeline document
```

The app sends one URL per request, in the order the editor entered them. It saves after each video. A failure keeps the transcripts that already succeeded, and the run continues with the next link.

The transcriber is reachable only on the Docker network. The app calls it with a shared secret. Editors talk only to the admin app.

## Pipeline collection

Slug `pipeline`. Singular and plural label: Pipeline. Admin group: Pipeline. `useAsTitle` is `name`. The collection is hidden from the public site.

Access for create, read, update, and delete is limited to logged-in editors. Anonymous requests are denied.

Fields:

| Field | Type | Role |
|---|---|---|
| `name` | text, required | Label in the Pipeline list |
| `videoLinks` | array of `{ url: text }` | Public `http` or `https` video URL. Empty is allowed on save. Generate Transcript requires at least one row. |
| `generateTranscript` | UI field | Starts a run for the saved document |
| `transcript` | textarea | Combined transcript, still editable |
| `status` | select: `idle`, `processing`, `ready`, `error` | Working state. Default `idle` |
| `statusMessage` | text | Progress or the reason a run stopped |

The document must already be saved. Generate Transcript does nothing until the document has an id, and the button tells the editor to save first. Saving once lets a long run keep writing if the editor leaves the page. Opening the document again shows the saved transcript and status.

While `status` is `processing`, the button is disabled. The status line is `Generating transcript for video N of M.` The screen re-reads the document every 3 seconds until status is `ready` or `error`.

A new run clears `transcript` before the first video. Each success appends one block:

```
## <video url>

<transcript text>
```

Blocks are separated by a blank line.

## Transcriber service

Docker Compose service name: `transcriber`. No host port. Volume `whisper-models` mounted at `/root/.cache/whisper` so the `turbo` weights download once.

Environment:

- `TRANSCRIBER_SECRET` on both services.
- `TRANSCRIBER_URL` on the app, pointing at `http://transcriber:8080`.

Endpoints:

- `GET /health` returns 200 when the process is up.
- `POST /transcribe` with header `Authorization: Bearer <TRANSCRIBER_SECRET>` and body `{ "url": "<https url>" }`.
- Success: `200` and `{ "transcript": "<text>" }`.
- Bad secret or missing secret: `401` and no download.
- Busy with another video: `409` and `{ "error": "busy" }`.
- Bad URL, download failure, conversion failure, Whisper failure, or timeout: `422` and `{ "error": "<short reason>" }`.

For each request the service:

1. Creates a unique temp directory.
2. Runs yt-dlp to download audio only.
3. Runs ffmpeg to write a 16 kHz mono wav.
4. Runs Whisper `turbo` with task `transcribe` and automatic language detection.
5. Reads the transcript text.
6. Deletes the temp directory in a `finally` block, including when the process is killed at 30 minutes.

The 30-minute limit covers download, conversion, and transcription for that one URL. The service refuses a second `/transcribe` call while one is in progress.

## App route

`POST /api/pipeline/transcribe` with the saved document id. Payload session required.

Before starting, the route rejects the call when:

- The user is not logged in (`401`).
- The document does not exist (`404`).
- Any `videoLinks` row is empty or is not an `http` or `https` URL (`400`). The status line names the bad row. Nothing is downloaded.
- This document already has `status: processing` (`409`). The click does nothing.
- Any other Pipeline document has `status: processing`, or the transcriber returns `409` (`409`). This document’s transcript and status stay as they were. The screen shows: `Another transcript is already being generated. Try again when it finishes.`

On start, the route sets `status` to `processing`, clears `transcript`, and saves. It then calls the transcriber once per URL. After each success it appends that URL’s block and saves. After each failure it appends:

```
## <video url>

Could not transcribe this video: <short reason>
```

and continues. When the loop finishes, `status` is `ready` if every video succeeded, and `error` if any video failed. `statusMessage` is empty on success. On a partial failure it is `Some videos could not be transcribed.`

If the transcriber is unreachable or returns `401`, the route stops the loop, keeps finished blocks, sets `status` to `error`, and sets `statusMessage` to the reason. Temp files for the failed attempt are the transcriber’s responsibility and are already removed.

## Error handling

| What happened | What the editor sees | What is stored |
|---|---|---|
| Link is missing, or is not `http`/`https` | The button does not start. The status line names the bad row. | No download. |
| Document is not saved yet | The button asks for a save first. | Nothing is transcribed. |
| This document is already processing | The button stays disabled. | The in-progress job keeps going. |
| Another document is already processing | A busy message. This document is unchanged. | The other job keeps going. |
| yt-dlp cannot read the URL | That URL is marked failed in the transcript. The next link still runs. | No media left on disk. |
| ffmpeg or Whisper fails | Same as a bad URL. | Temp directory deleted. |
| One video passes 30 minutes | That video is stopped and marked failed. The next link still runs. | Temp directory deleted. |
| The transcriber is down or the shared secret does not match | Status becomes `error`. Blocks already written in this run stay. | No new download. |

## Testing

Automated tests do not load Whisper `turbo`.

- URL checks reject an empty list, a blank row, and any value that is not `http` or `https`. A YouTube, Vimeo, and Bilibili `https` link passes.
- The transcript builder writes the URL heading and keeps earlier blocks when a later video fails.
- The app route returns `401` when no editor is logged in, and `409` when this document is already `processing`.
- The transcriber deletes its temp directory after a success, after a thrown error, and after the 30-minute kill. Tests replace yt-dlp and Whisper with fakes and assert the directory is gone.
- A shared-secret mismatch returns `401` before any download starts.

Manual check on a machine with the transcriber running:

- Save a Pipeline document with one short public video, click Generate Transcript, confirm the transcript field fills, and confirm the temp directory is gone.
- Add a second unreachable URL and run again. The run replaces the previous transcript. Confirm the successful video’s new transcript is present, the bad URL is noted, and status is `error`.

## Out of scope

- Publishing Pipeline documents on the public website.
- Translating speech into English.
- Speaker labels, word timestamps, and subtitle files.
- Keeping a copy of the video or audio after transcription.
- Running more than one Whisper `turbo` transcription at a time.
