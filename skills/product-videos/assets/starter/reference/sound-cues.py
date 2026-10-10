"""Find sound-effect hits in a music-backed mix.

Music in launch videos is a steady loop; effects are transients that don't follow the beat. For each
band we compute a short-time energy envelope, compare it with its local median (the music's level),
and report peaks that stand well above it. Prints a cue table; with --clips DIR, writes a short clip
(0.15 s before to 0.9 s after) around each cue for listening and timing.

usage: python3 -I reference/sound-cues.py audio.wav [--offbeat] [--clips DIR] [--threshold 6]
(needs: pip install numpy scipy; get the audio with: npx remotion ffmpeg -i ref.mp4 -vn -ac 2 -ar 48000 ref.wav)
"""
import sys, os, wave
import numpy as np
from scipy.signal import butter, sosfiltfilt, find_peaks
from scipy.ndimage import median_filter

path = sys.argv[1]
clips = sys.argv[sys.argv.index("--clips") + 1] if "--clips" in sys.argv else None
thr_db = float(sys.argv[sys.argv.index("--threshold") + 1]) if "--threshold" in sys.argv else 6.0

w = wave.open(path)
sr, ch, n = w.getframerate(), w.getnchannels(), w.getnframes()
raw = np.frombuffer(w.readframes(n), dtype=np.int16).reshape(-1, ch).astype(np.float32) / 32768
mono = raw.mean(axis=1)

hop = int(sr * 0.01)  # 10 ms frames
def env(x):
    frames = len(x) // hop
    e = np.sqrt(np.mean(x[: frames * hop].reshape(frames, hop) ** 2, axis=1) + 1e-12)
    return 20 * np.log10(e)

bands = {"low (<200 Hz)": (None, 200), "mid (200-2k)": (200, 2000), "high (2k-10k)": (2000, 10000)}
envs = {}
for name, (lo, hi) in bands.items():
    if lo is None: sos = butter(4, hi, "lowpass", fs=sr, output="sos")
    else: sos = butter(4, [lo, hi], "bandpass", fs=sr, output="sos")
    envs[name] = env(sosfiltfilt(sos, mono))
full = env(mono)

cues = []
for name, e in envs.items():
    base = median_filter(e, size=151)  # 1.5 s running median: the music's level in this band
    rise = e - base
    peaks, props = find_peaks(rise, height=thr_db, distance=15, prominence=thr_db * 0.8)
    for p in peaks:
        # how long it stays above the music: the effect's length
        end = p
        while end < len(rise) - 1 and rise[end] > 2: end += 1
        start = p
        while start > 0 and rise[start - 1] > 2 and p - start < 30: start -= 1
        cues.append((start * 0.01, name, float(rise[p]), (end - start) * 0.01, float(e[p])))

cues.sort()
# merge cues within 60 ms across bands into one event
events = []
for c in cues:
    if events and c[0] - events[-1]["t"] < 0.06:
        events[-1]["bands"].append(c[1]); events[-1]["over"] = max(events[-1]["over"], c[2]); events[-1]["len"] = max(events[-1]["len"], c[3])
    else:
        events.append({"t": c[0], "bands": [c[1]], "over": c[2], "len": c[3]})

# The music's beat: autocorrelate the low band's onset strength (lags 0.3-0.8 s = 75-200 bpm), then
# find the phase where beats line up with the strongest onsets. Independent of the threshold.
low = envs["low (<200 Hz)"]
flux = np.maximum(0, np.diff(low, prepend=low[0]))
flux = flux - flux.mean()
ac = np.correlate(flux, flux, mode="full")[len(flux) - 1:]
lags = np.arange(30, 81)  # in 10 ms frames
period_f = int(lags[np.argmax(ac[lags])])
# refine to a fraction of a frame with a parabola through the peak
y0, y1, y2 = ac[period_f - 1], ac[period_f], ac[period_f + 1]
period_f = period_f + 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2 + 1e-12)
period = period_f * 0.01
# fine search of period and phase together: a small tempo error grows into a large one over a minute
def grid_score(per, ph):
    idx = np.round((ph + np.arange(int((len(flux) * 0.01 - ph) / per)) * per) / 0.01).astype(int)
    idx = idx[idx < len(flux)]
    return flux[idx].sum()
best = max(((grid_score(per, ph), per, ph) for per in np.linspace(period * 0.99, period * 1.01, 121) for ph in np.arange(0, per, 0.005)))
_, period, phase = best
print(f"music beat: {period:.4f} s = {60 / period:.1f} bpm, phase {phase:.3f} s\n")
for e in events:
    r = (e["t"] - phase) % period; r = min(r, period - r)
    e["onbeat"] = r < 0.045 and e["t"] > 1.0
if "--offbeat" in sys.argv: events = [e for e in events if not e["onbeat"]]

print(f"{'time':>6}  {'frame':>5}  {'above music':>11}  {'length':>6}  bands")
for ev in events:
    print(f"{ev['t']:6.2f}  {round(ev['t']*30):5d}  {ev['over']:8.1f} dB  {ev['len']:5.2f}s  {', '.join(sorted(set(ev['bands'])))}{'  (beat)' if ev['onbeat'] else ''}")

if clips:
    os.makedirs(clips, exist_ok=True)
    for i, ev in enumerate(events):
        a = max(0, int((ev["t"] - 0.15) * sr)); b = min(len(raw), int((ev["t"] + max(0.9, ev["len"] + 0.2)) * sr))
        seg = (np.clip(raw[a:b], -1, 1) * 32767).astype(np.int16)
        out = wave.open(os.path.join(clips, f"cue{i+1:02d}-{ev['t']:05.2f}s.wav"), "wb")
        out.setnchannels(ch); out.setsampwidth(2); out.setframerate(sr); out.writeframes(seg.tobytes()); out.close()
    print(f"\n{len(events)} clips in {clips}")
