# Deep verification

Fact-checking every claim in the graph against the source. Cheap checks
(`kg.mjs check`, `kg.mjs stale`) catch structure; this catches sentences that
are wrong.

Run it when asked, before a release, or after writing a batch of pages. It
costs real tokens — say so before starting a large one.

## Shape

Group the pages (two or three each, by subject so one agent reads one area of
the source), and give every group an agent. Add one agent that looks for what is
missing. They report; they do not edit — one writer keeps the voice consistent
and can weigh findings against each other.

With the Workflow tool available, `parallel()` over the groups plus the critic.
Otherwise spawn the same agents with the Agent tool. Either way, force
structured output: `doc`, `claim` (quoted), `problem` (what the code does, with
file:line evidence), `correction` (exact replacement wording), `severity`
(`wrong` | `misleading` | `nitpick`).

## The verifier prompt

Tell each agent, in its own words:

- Read these pages, and check **every** factual claim against the source. Be
  adversarial: assume each claim is wrong until the code proves it.
- Check exact names — identifiers, codes, statuses, columns, routes, events,
  option names, npm scripts (read the manifest), CLI commands, test files and
  the test titles referenced.
- Check ordering ("in this order"), conditions ("only when"), defaults, and
  numbers — timeouts, retention, limits, HTTP statuses.
- Do not edit anything. Report only, with file:line evidence, and only where a
  reader would be misled. No style opinions.
- Claims about what an external system answered cannot be checked from source —
  skip them, except where the page says what *this* code does with the answer.

## The completeness critic

One agent, no page group: read the whole folder, survey the repo, and report
what a new engineer would need that is missing or out of date — features,
routes, jobs, scripts or modules no page mentions; commands the pages name that
do not exist; knowledge split across the wrong pages; an index that no longer
matches the files.

Its findings are usually the most valuable of the run, because they are what
nobody thought to write.

## Judging the findings

**Check each finding against the source before acting on it.** Agents are
confidently wrong too. On one run, an agent insisted a suite had 196
tests because it counted `it(` occurrences; the suite reports 199, because some
tests loop.

Fix the `wrong` and `misleading` ones. Weigh the nitpicks: precision that helps
a reader is worth it, hedging that muddies a sentence is not.

When a finding shows the *code* is wrong rather than the page — a log level that
contradicts what the docs promise, an error that tells a caller to retry
something that can never succeed — fix the code, and say so. A verification pass
that only ever edits prose is missing half of what it finds.

## Second round

After fixing, re-verify the pages you changed. Corrections introduce their own
errors: a second round once found nine more, three of them wrong,
in text written to fix the first round.
