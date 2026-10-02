# Accuracy: show only what is real

A product video is a promise. If it shows a button, a status, a message or a behaviour, a viewer
will expect to find it. The first launch video made for the project this skill came from invented
a "Send payouts" button (the real one was "Run payout cycle", behind a confirmation dialog),
"Ready/Sending" statuses (real: Queued, Submitted, Settled), a "New conversion" toast that didn't
exist, a banner, live-updating counters, and the wrong link format. Each looked plausible. The user
caught it, and everything was rebuilt. This file is how to avoid that.

## Allowed and not allowed

| Fine: motion and data | Not fine: invention |
|---|---|
| Zooms, pans, a cursor that moves and clicks | A button, menu, field or page the app doesn't have |
| Numbers counting up to the value the screen really shows | A live ticker or auto-refresh the app doesn't do |
| Typing at a readable speed into a real field | A toast, banner or confirmation the app never shows |
| Illustrative people, companies, amounts, dates | Status names, labels or copy that differ from the app's |
| A placeholder hostname (payouts.example.com) when the app shows localhost | A feature that is planned, not built |
| Highlight rings around real elements; annotations outside the app window | Screens restyled into something "nicer" than the product |
| Leaving out parts of a screen (cropping) | Merging two screens into one that doesn't exist |

When a story beat has no real counterpart, say so and offer the nearest real moment. Don't fill the
gap.

## How to verify

1. **Read the code for every beat.** Find the page or component and the exact strings: button labels,
   headings, help text, status labels and their colours, empty states, placeholders, default values,
   pending labels ("Saving…"), what a successful action shows ("Policy saved.") and what changes after
   (form reset? redirect? a row appears?).
2. **Capture the running app** (`reference/capture.mjs`): every screen and opened state, at the
   viewport the video draws on, in the theme it uses. Read-only: open a dialog to capture it; never
   confirm, save, send or delete. Re-capture states you can't get without writing data only with the
   user's permission, or rebuild them from code alone and say so.
3. **Rebuild from the screenshot, check against the code.** Where they disagree, the running app
   wins for looks and the code wins for behaviour; ask if it matters.
4. **Mind state between scenes.** If a scene rejects an item, later scenes must not show it waiting;
   counts and totals must follow (e.g. "Waiting 5 → 4", "Money on hold $690.00 → $640.00"). Keep
   lists in their real order (oldest first, newest first).
5. **Check the user's own app changed under you.** Before final renders, check the repo for UI
   commits made during the work (another session or teammate may have renamed a label).

## Data

- Prefer the product's real demo data where it exists; it is consistent by construction.
- Illustrative data must be internally consistent: commissions match their rate, currency amounts
  match one exchange rate, dates fall in order, balances equal their parts.
- Use the app's own formatting (currency symbols vs codes, date format, thousands separators).
- Never show real customer data, real secrets or keys. Generate fake ones in the real format
  (`whsec_` + 64 hex).

## In the delivery note

List what is placeholder: illustrative names and amounts, hostnames, a product name that isn't final,
screens rebuilt from code without a screenshot. One line each.
