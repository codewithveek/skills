# Sound effects: sources and licences

Every file here may be used, changed and shipped in commercial videos without attribution. Keep
this list current when adding a sound: only CC0 / public-domain files, or sounds the kit makes itself.

| File | Source | Licence |
|---|---|---|
| `mouse-click.wav`, `whoosh.wav` | `@remotion/sfx` (its CC0 subset) | CC0 |
| `tick.wav` | Kenney, *Interface Sounds* 1.0: `tick_002` | CC0 |
| `pop.wav` | Kenney, *Interface Sounds* 1.0: `drop_002` | CC0 |
| `confirm.wav` | Kenney, *Interface Sounds* 1.0: `confirmation_001` | CC0 |
| `alert.wav` | Kenney, *Interface Sounds* 1.0: `error_004` | CC0 |
| `glitch.wav` | Kenney, *Interface Sounds* 1.0: `glitch_001` | CC0 |
| `open.wav` | Kenney, *Interface Sounds* 1.0: `maximize_009` | CC0 |
| `stamp.wav` | Kenney, *Impact Sounds* 1.0: `impactPunch_medium_001` | CC0 |
| `land.wav` | Kenney, *Impact Sounds* 1.0: `impactWood_light_000` | CC0 |
| `blip.wav` | Kenney, *Digital Audio* 1.0: `pepSound3` | CC0 |
| `swish.wav`, `air.wav`, `riser.wav`, `thump.wav` | Made by the kit (`npm run sfx`, `scripts/sfx.mts`) | Original; no third-party rights |

Kenney packs: https://kenney.nl/assets (CC0 1.0, http://creativecommons.org/publicdomain/zero/1.0/).
Crediting Kenney is welcome but not required.

The Kenney files were converted to 48 kHz mono 16-bit WAV, trimmed of leading and trailing silence,
and normalised to -16 LUFS with peaks at -1 dBFS, so their default levels in `src/kit/Sfx.tsx` are
comparable.
