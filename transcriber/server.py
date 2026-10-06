import json
import os
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import gettempdir

from transcribe import TranscriptionError, transcribe_url


def serve(transcribe, secret, lock, port=0):
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path != "/health":
                self._json(404, {"error": "Not found"})
                return
            self._json(200, {"ok": True})

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

    def transcribe(url):
        return transcribe_url(url, run=_subprocess_run, work_root=Path(gettempdir()))

    serve(transcribe, secret, lock, port=8080)
    threading.Event().wait()


def _subprocess_run(command, timeout):
    return __import__("subprocess").run(command, timeout=timeout, check=False)


if __name__ == "__main__":
    main()
