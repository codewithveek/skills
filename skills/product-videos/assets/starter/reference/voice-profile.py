"""Profile a voiceover: transcript with word timings, speaking rate, pauses, pitch.

usage: python3 -I reference/voice-profile.py audio.wav
(needs: pip install faster-whisper librosa; the small.en model, ~460 MB, downloads on first run)
"""
import sys
import numpy as np
import librosa
from faster_whisper import WhisperModel

path = sys.argv[1]
model = WhisperModel("small.en", device="cpu", compute_type="int8")
audio16, _ = librosa.load(path, sr=16000, mono=True)  # decode ourselves: faster-whisper's PyAV path breaks on some PyAV versions
segments, info = model.transcribe(audio16, word_timestamps=True, vad_filter=True)
words = []
for seg in segments:
    print(f"[{seg.start:5.2f}-{seg.end:5.2f}] {seg.text.strip()}")
    for w in seg.words or []:
        words.append((w.start, w.end, w.word.strip()))

if words:
    speech = sum(e - s for s, e, _ in words)
    span = words[-1][1] - words[0][0]
    gaps = [b[0] - a[1] for a, b in zip(words, words[1:])]
    print(f"\n{len(words)} words over {span:.1f} s: {len(words) / span * 60:.0f} wpm overall, {len(words) / speech * 60:.0f} wpm while speaking")
    print(f"pauses over 0.3 s: {sum(g > 0.3 for g in gaps)}, longest {max(gaps):.2f} s; median word {np.median([e - s for s, e, _ in words]):.2f} s")

y, sr = librosa.load(path, sr=16000, mono=True)
f0, voiced, _ = librosa.pyin(y, fmin=60, fmax=400, sr=sr, frame_length=1024)
f0 = f0[voiced & ~np.isnan(f0)]
if len(f0):
    print(f"\npitch: median {np.median(f0):.0f} Hz, 10-90% {np.percentile(f0, 10):.0f}-{np.percentile(f0, 90):.0f} Hz, spread {12 * np.log2(np.percentile(f0, 90) / np.percentile(f0, 10)):.1f} semitones")
    m = np.median(f0)
    print("register:", "low male" if m < 110 else "male" if m < 150 else "low female / high male" if m < 175 else "female" if m < 230 else "high female")
