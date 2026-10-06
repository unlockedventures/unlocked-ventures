import shutil
import subprocess
import tempfile
import time
import urllib.parse
from pathlib import Path


class TranscriptionError(Exception):
    pass


def transcribe_url(url, *, run, work_root, timeout_seconds=1800):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise TranscriptionError("The video link must start with http:// or https://.")

    directory = Path(tempfile.mkdtemp(prefix="pipeline-", dir=work_root))
    deadline = time.monotonic() + timeout_seconds
    try:
        source_template = str(directory / "source.%(ext)s")
        _run(
            ["yt-dlp", "-x", "--audio-format", "wav", "-o", source_template, "--no-playlist", url],
            run,
            deadline,
            "Could not download audio from this video.",
        )
        sources = [path for path in directory.iterdir() if path.name.startswith("source.")]
        if len(sources) != 1:
            raise TranscriptionError("Could not download audio from this video.")

        audio = directory / "audio.wav"
        _run(
            ["ffmpeg", "-y", "-i", str(sources[0]), "-ac", "1", "-ar", "16000", str(audio)],
            run,
            deadline,
            "Could not convert this video's audio.",
        )
        _run(
            [
                "whisper",
                str(audio),
                "--model",
                "turbo",
                "--task",
                "transcribe",
                "--output_format",
                "txt",
                "--output_dir",
                str(directory),
                "--fp16",
                "False",
            ],
            run,
            deadline,
            "Could not transcribe this video.",
        )
        transcript_path = directory / "audio.txt"
        if not transcript_path.is_file():
            raise TranscriptionError("Could not transcribe this video.")
        return transcript_path.read_text(encoding="utf-8").strip()
    finally:
        shutil.rmtree(directory, ignore_errors=True)


def _run(command, run, deadline, failure):
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise TranscriptionError("This video took longer than 30 minutes.")
    try:
        completed = run(command, remaining)
    except subprocess.TimeoutExpired as error:
        raise TranscriptionError("This video took longer than 30 minutes.") from error
    if completed.returncode != 0:
        raise TranscriptionError(failure)
