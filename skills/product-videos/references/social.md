# Social cutdowns and platform delivery

## Shapes and lengths

| Platform | Shape | Size | Good length | Notes |
|---|---|---|---|---|
| YouTube | 16:9 | 1920x1080 | full video | Upload the 1280x720 thumbnail (under 2 MB) and the `.vtt` |
| YouTube Shorts, TikTok, Instagram Reels | 9:16 | 1080x1920 | 15–30 s (under 60) | Captions burned in; hook in the first second |
| LinkedIn, X | 16:9 or 1:1 | 1920x1080 / 1080x1080 | 30–60 s | Autoplays muted: burned-in captions help; attach the `.vtt` where offered |
| Website hero | 16:9, muted loop | 1920x1080 | 10–20 s | No voice; strong first frame; a short H.264 file |
| Product Hunt / landing gallery | 16:9 | 1920x1080 | 30–60 s | The thumbnail is the first impression |

## Making a cutdown

- Use the same scenes (`VERTICAL` in `Root.tsx`), but consider a shorter cut list: problem line,
  name, two or three product moments, close. A separate timeline id for the cutdown keeps the long
  version intact.
- Hook in the first second: start on the problem words or the most striking moment, not a logo.
- Keep text inside the safe area: platform buttons and captions cover the right edge and the bottom
  fifth of a 9:16 frame. The kit's burned captions sit at 14% from the bottom; keep key UI above it.
- Zoom harder than in 16:9; nothing under about 28 px (at 1080 wide) is readable on a phone.

## Captions

- Ship a `.vtt` with every video (players and platforms that accept it).
- Burn them in for 9:16 and feed-first platforms (`makeVideo(..., burnCaptions = true)`): most viewers
  start muted.
- One sentence at a time, at most two lines, high contrast on a dark pill.

## Thumbnails

- 16:9 at 1280x720 for upload; 1920x1080 PNG for sites that want more.
- Show the product: a real, resolved screen (a chart drawn, a status settled), not a stock image.
- Big, short text: two lines, five words or fewer, the second line in the brand colour.
- **Open on the thumbnail.** X, LinkedIn and most feeds use the video's opening frame as its preview
  and ignore embedded cover art. The kit's 16:9 videos therefore open on their thumbnail, held for
  25 frames, then crossfade into the video (`OPEN_ON_THUMBNAIL` in `Root.tsx`); captions shift with
  it. This works everywhere, with no account features.
- Where a platform lets you set a thumbnail, upload the 1280x720 JPG as well: YouTube (custom
  thumbnail), X (the iOS app, or Media Studio with Premium, since July 2026).
- The kit also embeds the thumbnail as MP4 cover art, which file browsers and VLC show.
