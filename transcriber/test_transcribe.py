import json
import shutil
import subprocess
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path

from server import serve
from transcribe import (
    TranscriptionError,
    segment_end_seconds,
    strip_trailing_hallucinations,
    transcribe_url,
    whisper_percent_for_seconds,
)

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


class ProgressParseTests(unittest.TestCase):
    def test_reads_segment_end_times(self):
        self.assertEqual(segment_end_seconds("[00:22.000 --> 00:28.000] text"), 28.0)
        self.assertEqual(segment_end_seconds("[01:02.000 --> 01:08.000] text"), 68.0)

    def test_maps_audio_position_into_the_whisper_range(self):
        self.assertEqual(whisper_percent_for_seconds(0, 100), 40)
        self.assertEqual(whisper_percent_for_seconds(50, 100), 69)
        self.assertEqual(whisper_percent_for_seconds(100, 100), 99)


class HallucinationCleanupTests(unittest.TestCase):
    def test_strips_trailing_repeated_thank_yous(self):
        text = "\n".join(
            [
                "We cooked faster than the drive-thru.",
                "Thank you.",
                "Thank you so much for it.",
                "Thank you.",
                "Thank you.",
                "Thank you.",
                "Thank you.",
                "Thank you.",
            ]
        )
        cleaned = strip_trailing_hallucinations(text)
        self.assertEqual(cleaned, "We cooked faster than the drive-thru.")

    def test_keeps_a_single_closing_thank_you(self):
        text = "That is the story.\nThank you."
        self.assertEqual(strip_trailing_hallucinations(text), text)

    def test_strips_identical_trailing_lines(self):
        text = "Real ending.\nThanks.\nThanks.\nThanks.\nThanks."
        self.assertEqual(strip_trailing_hallucinations(text), "Real ending.")


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

    def test_reports_progress_for_an_authorized_client(self):
        progress = {"percent": 42}
        server = serve(lambda url: url, "secret", threading.Lock(), progress=progress)
        self.addCleanup(server.shutdown)
        request = urllib.request.Request(
            f"http://127.0.0.1:{server.server_address[1]}/progress",
            headers={"Authorization": "Bearer secret"},
        )
        with urllib.request.urlopen(request) as response:
            body = json.loads(response.read().decode("utf-8"))
        self.assertEqual(body, {"percent": 42})
