# Preset fit report — api-launch

- Beats fitted: 25; accepted into the library: 11 (0 spring, 11 bezier)
- Library presets (shape clusters): 10

## Library

| Preset | Channel | Easing | Median duration | Median travel | Beats | Mean RMSE |
|---|---|---|---|---|---|---|
| bezier-custom-01 | translateX | bezier(0.53, 0.05, 0, 1.08) | 350 ms | 154.78 | 2 | 0.0192 |
| bezier-custom-02 | translateX | bezier(0.72, 0.18, 0, 0.83) | 733 ms | -261.72 | 1 | 0.0112 |
| bezier-custom-03 | scale | bezier(1, 0.37, 0.16, -0.05) | 200 ms | -12.39 | 1 | 0.0246 |
| bezier-custom-04 | translateY | bezier(1, 1.12, 0.72, 1.02) | 333 ms | 280.35 | 1 | 0.0347 |
| linear-01 | translateY | bezier(1, 0.96, 0.2, 0.2) | 3433 ms | -863.16 | 1 | 0.0161 |
| bezier-custom-05 | translateY | bezier(0.13, 0.2, 1, 0.4) | 333 ms | -4.98 | 1 | 0.0283 |
| bezier-custom-06 | translateY | bezier(0.65, -0.03, 0, 1.07) | 533 ms | -97.88 | 1 | 0.0228 |
| bezier-custom-07 | translateY | bezier(1, -0.32, 0, 1.35) | 233 ms | 50.48 | 1 | 0.0346 |
| bezier-custom-08 | translateY | bezier(1, 0, 0.41, 1.05) | 1167 ms | -148.26 | 1 | 0.0599 |
| bezier-custom-09 | translateY | bezier(0.8, 1.01, 0.23, 1.17) | 800 ms | 361.99 | 1 | 0.0458 |

## Every beat

| Beat | Frames | Scene | Channel | Travel | Best easing | RMSE | Nearest named | Quality | In library |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 1–22 | 01-video | translateY | 67.72 px | bezier(0.49, -0.31, 0, 1.34) | 0.0958 | css-ease (0.166) | 0.6002 | no |
| 2 | 23–34 | 01-video | scale | 38.11 pct | bezier(0, 0.3, 0, 0.2) | 0.0748 | css-ease-out (0.095) | 0.9593 | no |
| 3 | 35–67 | 01-video | progress | 1 progress | bezier(0.49, -0.19, 0, 1.23) | 0.0449 | css-ease (0.125) | 0.5 | no |
| 7 | 73–80 | 01-video | translateX | 154.78 px | bezier(0.53, 0.05, 0, 1.08) | 0.0229 | css-ease (0.084) | 1 | yes |
| 8 | 81–93 | 01-video | translateY | -152.98 px | bezier(0.55, 0.09, 0, 0.99) | 0.0155 | css-ease (0.079) | 0.997 | yes |
| 10 | 96–105 | 01-video | translateY | -4.98 px | bezier(0.13, 0.2, 1, 0.4) | 0.0283 | css-ease-in (0.088) | 0.9484 | yes |
| 11 | 106–111 | 01-video | scale | -12.39 pct | bezier(1, 0.37, 0.16, -0.05) | 0.0246 | css-ease-in (0.066) | 1 | yes |
| 14 | 121–127 | 01-video | translateY | 50.48 px | bezier(1, -0.32, 0, 1.35) | 0.0346 | ease-in-out-back (0.091) | 0.8898 | yes |
| 15 | 128–137 | 01-video | translateY | 280.35 px | bezier(1, 1.12, 0.72, 1.02) | 0.0347 | css-ease-out (0.076) | 0.9969 | yes |
| 16 | 138–161 | 01-video | translateY | 361.99 px | bezier(0.8, 1.01, 0.23, 1.17) | 0.0458 | css-ease (0.098) | 0.6762 | yes |
| 17 | 162–220 | 01-video | progress | 1 progress | bezier(0.6, 0.42, 0, 0.36) | 0.0084 | linear (0.076) | 0.5 | no |
| 18 | 221–260 | 01-video | progress | 1 progress | bezier(0.39, 0.06, 0.6, 1.1) | 0.0154 | css-ease-in-out (0.048) | 0.5 | no |
| 19 | 261–292 | 01-video | translateX | -22.01 px | bezier(1, -0.22, 0.68, 1.17) | 0.1053 | css-ease-in (0.209) | 0.7156 | no |
| 20 | 293–345 | 01-video | progress | 1 progress | bezier(0.25, 0.48, 0, 0.84) | 0.0221 | ease-out-cubic (0.057) | 0.5 | no |
| 21 | 346–380 | 01-video | translateY | -148.26 px | bezier(1, 0, 0.41, 1.05) | 0.0599 | css-ease-in (0.147) | 0.7008 | yes |
| 22 | 381–402 | 01-video | translateX | -261.72 px | bezier(0.72, 0.18, 0, 0.83) | 0.0112 | css-ease-in-out (0.125) | 1 | yes |
| 23 | 403–415 | 01-video | translateX | -50.76 px | bezier(0.83, -0.17, 0, 1.43) | 0.0820 | ease-in-out-quint (0.208) | 0.7223 | no |
| 24 | 416–425 | 01-video | translateY | -41.16 px | bezier(1, -0.02, 0.58, -0.6) | 0.1190 | css-ease-in (0.384) | 0.6774 | no |
| 25 | 426–439 | 01-video | translateY | -33.8 px | bezier(0.32, 0.26, 0, 1.34) | 0.1118 | ease-out-quint (0.167) | 0.8322 | no |
| 26 | 440–494 | 01-video | progress | 1 progress | bezier(0.45, 0.01, 0.58, -0.22) | 0.0528 | css-ease-in (0.201) | 0.5 | no |
| 27 | 495–510 | 01-video | translateX | -160.58 px | bezier(0.33, -0.47, 0, 1.59) | 0.1085 | ease-out-cubic (0.194) | 0.7026 | no |
| 38 | 536–560 | 01-video | progress | 1 progress | bezier(0.95, 1.16, 0.59, 0.9) | 0.0556 | css-ease-out (0.068) | 0.5 | no |
| 40 | 573–588 | 01-video | translateY | -97.88 px | bezier(0.65, -0.03, 0, 1.07) | 0.0228 | css-ease (0.137) | 0.9337 | yes |
| 41 | 589–660 | 01-video | progress | 1 progress | bezier(0.6, -0.12, 0.72, 1.11) | 0.0090 | css-ease-in (0.085) | 0.5 | no |
| 42 | 661–763 | 01-video | translateY | -863.16 px | bezier(1, 0.96, 0.2, 0.2) | 0.0161 | linear (0.019) | 0.977 | yes |
