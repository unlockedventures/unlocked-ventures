import json
import os
import subprocess
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import gettempdir

from transcribe import (
    TranscriptionError,
    segment_end_seconds,
    transcribe_url,
    whisper_percent_for_seconds,
)


def serve(transcribe, secret, lock, port=0, progress=None):
    state = progress if progress is not None else {"percent": 0}

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/health":
                self._json(200, {"ok": True})
                return
            if self.path == "/progress":
                if self.headers.get("Authorization", "") != f"Bearer {secret}":
                    self._json(401, {"error": "Unauthorized"})
                    return
                self._json(200, {"percent": int(state.get("percent", 0))})
                return
            self._json(404, {"error": "Not found"})

        def do_POST(self):
            if self.path != "/transcribe":
                self._json(404, {"error": "Not found"})
                return
            if self.headers.get("Authorization", "") != f"Bearer {secret}":
                self._json(401, {"error": "Unauthorized"})
                return
            if not lock.acquire(blocking=False):
                self._json(409, {"error": "busy"})
                return
            try:
                length = int(self.headers.get("Content-Length", "0"))
                raw = self.rfile.read(length)
                try:
                    body = json.loads(raw.decode("utf-8"))
                    url = body["url"]
                except (json.JSONDecodeError, KeyError, TypeError, UnicodeDecodeError):
                    self._json(422, {"error": "The video link must start with http:// or https://."})
                    return
                try:
                    transcript = transcribe(url)
                except TranscriptionError as error:
                    self._json(422, {"error": str(error)})
                    return
                self._json(200, {"transcript": transcript})
            finally:
                state["percent"] = 0
                lock.release()

        def _json(self, status, payload):
            encoded = json.dumps(payload).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(encoded)))
            self.end_headers()
            self.wfile.write(encoded)

        def log_message(self, fmt, *args):
            return

    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


def main():
    secret = os.environ.get("TRANSCRIBER_SECRET", "")
    lock = threading.Lock()
    progress = {"percent": 0}

    def on_progress(percent):
        progress["percent"] = int(percent)

    def run(command, timeout):
        return subprocess.run(command, timeout=timeout, check=False)

    def stream_whisper(command, timeout, report_at_least):
        audio = command[1]
        duration = _probe_duration(audio)
        deadline = time.monotonic() + timeout
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )
        try:
            assert process.stdout is not None
            for line in process.stdout:
                if time.monotonic() > deadline:
                    raise subprocess.TimeoutExpired(command, timeout)
                print(line, end="", flush=True)
                end = segment_end_seconds(line)
                if end is not None:
                    report_at_least(whisper_percent_for_seconds(end, duration))
            returncode = process.wait(timeout=max(1, deadline - time.monotonic()))
        except subprocess.TimeoutExpired as error:
            process.kill()
            process.wait(timeout=5)
            raise error
        return subprocess.CompletedProcess(command, returncode)

    run.stream_whisper = stream_whisper

    def transcribe(url):
        progress["percent"] = 0
        return transcribe_url(
            url,
            run=run,
            work_root=Path(gettempdir()),
            on_progress=on_progress,
        )

    serve(transcribe, secret, lock, port=8080, progress=progress)
    threading.Event().wait()


def _probe_duration(path):
    try:
        completed = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                str(path),
            ],
            check=False,
            capture_output=True,
            text=True,
            timeout=30,
        )
        if completed.returncode != 0:
            return 0.0
        return float(completed.stdout.strip())
    except (ValueError, subprocess.TimeoutExpired, OSError):
        return 0.0


if __name__ == "__main__":
    main()
