import re
import shutil
import subprocess
import tempfile
import threading
import time
import urllib.parse
from pathlib import Path


class TranscriptionError(Exception):
    pass


_SEGMENT_END = re.compile(
    r"-->\s*(?:(\d{2}):)?(\d{2}):(\d{2}\.\d+|\d{2})"
)


def transcribe_url(url, *, run, work_root, timeout_seconds=1800, on_progress=None):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise TranscriptionError("The video link must start with http:// or https://.")

    directory = Path(tempfile.mkdtemp(prefix="pipeline-", dir=work_root))
    deadline = time.monotonic() + timeout_seconds
    report = on_progress or (lambda _percent: None)
    try:
        report(1)
        source_template = str(directory / "source.%(ext)s")
        _run_with_crawl(
            ["yt-dlp", "-x", "--audio-format", "wav", "-o", source_template, "--no-playlist", url],
            run,
            deadline,
            "Could not download audio from this video.",
            report,
            start_percent=1,
            end_percent=29,
            step_seconds=2,
        )
        sources = [path for path in directory.iterdir() if path.name.startswith("source.")]
        if len(sources) != 1:
            raise TranscriptionError("Could not download audio from this video.")

        report(30)
        audio = directory / "audio.wav"
        _run(
            ["ffmpeg", "-y", "-i", str(sources[0]), "-ac", "1", "-ar", "16000", str(audio)],
            run,
            deadline,
            "Could not convert this video's audio.",
        )
        report(40)
        _run_whisper(
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
                # Applause / silence often becomes a "Thank you" repetition loop.
                "--condition_on_previous_text",
                "False",
                "--no_speech_threshold",
                "0.45",
                "--hallucination_silence_threshold",
                "2.0",
            ],
            run,
            deadline,
            report,
        )

        transcript_path = directory / "audio.txt"
        if not transcript_path.is_file():
            raise TranscriptionError("Could not transcribe this video.")
        report(100)
        raw = transcript_path.read_text(encoding="utf-8").strip()
        return strip_trailing_hallucinations(raw)
    finally:
        shutil.rmtree(directory, ignore_errors=True)


_THANKS_LINE = re.compile(
    r"^(?:thank(?:s|\s+you)(?:\s+so\s+much(?:\s+for\s+it)?)?[.!?]*)+$",
    re.IGNORECASE,
)


def strip_trailing_hallucinations(text: str) -> str:
    """Drop trailing repeated thank-you lines Whisper often invents over applause."""
    lines = [line.rstrip() for line in text.splitlines()]
    while lines and not lines[-1].strip():
        lines.pop()
    if not lines:
        return ""

    # Drop a trailing run of thank-you variants first (applause hallucinations).
    thanks_run = 0
    for line in reversed(lines):
        if _THANKS_LINE.match(line.strip()):
            thanks_run += 1
        else:
            break
    if thanks_run >= 3:
        lines = lines[:-thanks_run]
    elif thanks_run == 2:
        lines = lines[:-1]

    # Collapse any remaining identical trailing lines (3+).
    if lines:
        last = lines[-1].strip()
        if last:
            identical = 0
            for line in reversed(lines):
                if line.strip() == last:
                    identical += 1
                else:
                    break
            if identical >= 3:
                lines = lines[:-identical]

    while lines and not lines[-1].strip():
        lines.pop()
    return "\n".join(lines).strip()


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


def _run_with_crawl(command, run, deadline, failure, report, *, start_percent, end_percent, step_seconds):
    """Run a blocking command while slowly advancing progress so the UI does not sit at 0%."""
    holder = {"percent": start_percent}
    stop = threading.Event()
    report(start_percent)

    def crawl():
        while not stop.is_set() and holder["percent"] < end_percent:
            if stop.wait(step_seconds):
                break
            nxt = min(end_percent, holder["percent"] + 1)
            if nxt > holder["percent"]:
                holder["percent"] = nxt
                report(nxt)

    crawler = threading.Thread(target=crawl, daemon=True)
    crawler.start()
    try:
        _run(command, run, deadline, failure)
        report(end_percent)
    finally:
        stop.set()
        crawler.join(timeout=1)


def _run_whisper(command, run, deadline, report):
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise TranscriptionError("This video took longer than 30 minutes.")

    holder = {"percent": 40}
    stop_crawl = threading.Event()

    def report_at_least(percent):
        percent = min(99, max(40, int(percent)))
        if percent > holder["percent"]:
            holder["percent"] = percent
            report(percent)

    def crawl():
        while not stop_crawl.is_set() and holder["percent"] < 99:
            delay = 3 if holder["percent"] < 85 else 8 if holder["percent"] < 95 else 12
            if stop_crawl.wait(delay):
                break
            report_at_least(holder["percent"] + 1)

    crawler = threading.Thread(target=crawl, daemon=True)
    crawler.start()
    try:
        stream = getattr(run, "stream_whisper", None)
        if callable(stream):
            try:
                completed = stream(command, remaining, report_at_least)
            except subprocess.TimeoutExpired as error:
                raise TranscriptionError("This video took longer than 30 minutes.") from error
        else:
            try:
                completed = run(command, remaining)
            except subprocess.TimeoutExpired as error:
                raise TranscriptionError("This video took longer than 30 minutes.") from error
        if completed.returncode != 0:
            raise TranscriptionError("Could not transcribe this video.")
        report_at_least(99)
    finally:
        stop_crawl.set()
        crawler.join(timeout=1)


def segment_end_seconds(line):
    match = _SEGMENT_END.search(line)
    if not match:
        return None
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2))
    seconds = float(match.group(3))
    return hours * 3600 + minutes * 60 + seconds


def whisper_percent_for_seconds(end_seconds, duration_seconds):
    if duration_seconds <= 0 or end_seconds is None:
        return 40
    ratio = min(1.0, max(0.0, end_seconds / duration_seconds))
    return 40 + int(59 * ratio)
