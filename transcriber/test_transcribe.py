import shutil
import subprocess
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path

from server import serve
from transcribe import TranscriptionError, transcribe_url

URL = "https://www.youtube.com/watch?v=abcdefghijk"


class Completed:
    def __init__(self):
        self.returncode = 0


def successful_run(command, timeout):
    del timeout
    if command[0] == "yt-dlp":
        output = command[command.index("-o") + 1].replace("%(ext)s", "wav")
        Path(output).write_bytes(b"source")
    if command[0] == "whisper":
        directory = Path(command[command.index("--output_dir") + 1])
        (directory / "audio.txt").write_text("Hello from the video\n", encoding="utf-8")
    return Completed()


class TranscribeTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp())

    def tearDown(self):
        shutil.rmtree(self.root, ignore_errors=True)

    def test_deletes_the_directory_after_success(self):
        text = transcribe_url(URL, run=successful_run, work_root=self.root, timeout_seconds=30)
        self.assertEqual(text, "Hello from the video")
        self.assertEqual(list(self.root.iterdir()), [])

    def test_deletes_the_directory_when_the_download_fails(self):
        def fail_download(command, timeout):
            del timeout
            if command[0] == "yt-dlp":
                completed = Completed()
                completed.returncode = 1
                return completed
            return Completed()

        with self.assertRaises(TranscriptionError):
            transcribe_url(URL, run=fail_download, work_root=self.root, timeout_seconds=30)
        self.assertEqual(list(self.root.iterdir()), [])

    def test_deletes_the_directory_when_the_time_limit_is_hit(self):
        def time_out(command, timeout):
            raise subprocess.TimeoutExpired(command, timeout)

        with self.assertRaisesRegex(TranscriptionError, "30 minutes"):
            transcribe_url(URL, run=time_out, work_root=self.root, timeout_seconds=1)
        self.assertEqual(list(self.root.iterdir()), [])


class ServerTests(unittest.TestCase):
    def test_rejects_a_bad_secret_before_transcription(self):
        calls = []

        def transcribe(url):
            calls.append(url)
            return "nope"

        server = serve(transcribe, "secret", threading.Lock())
        self.addCleanup(server.shutdown)
        request = urllib.request.Request(
            f"http://127.0.0.1:{server.server_address[1]}/transcribe",
            data=b'{"url":"https://vimeo.com/123456789"}',
            headers={"Authorization": "Bearer wrong", "Content-Type": "application/json"},
            method="POST",
        )
        with self.assertRaises(urllib.error.HTTPError) as caught:
            urllib.request.urlopen(request)
        self.assertEqual(caught.exception.code, 401)
        self.assertEqual(calls, [])

    def test_returns_busy_while_a_transcription_is_running(self):
        started = threading.Event()
        release = threading.Event()

        def transcribe(url):
            del url
            started.set()
            release.wait(2)
            return "done"

        server = serve(transcribe, "secret", threading.Lock())
        self.addCleanup(server.shutdown)
        port = server.server_address[1]

        def call():
            request = urllib.request.Request(
                f"http://127.0.0.1:{port}/transcribe",
                data=b'{"url":"https://vimeo.com/123456789"}',
                headers={"Authorization": "Bearer secret", "Content-Type": "application/json"},
                method="POST",
            )
            return urllib.request.urlopen(request)

        first = threading.Thread(target=call)
        first.start()
        self.assertTrue(started.wait(2))
        with self.assertRaises(urllib.error.HTTPError) as caught:
            call()
        self.assertEqual(caught.exception.code, 409)
        release.set()
        first.join(2)
