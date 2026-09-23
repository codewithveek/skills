---
name: knowledge-graph
description: "Read, maintain and verify a repository's knowledge graph — the docs/knowledge-graph/ folder that maps every feature to how it works, where it lives, and how to run and test it. Use it at the start of work in a repo that has one (read before exploring), at the end of any work that changed the repo (update what the change touched), when a repo has no graph yet (bootstrap one), and when asked to check whether the docs are still true, find what has gone stale, or build the reading order. Also use when the user says 'knowledge graph', 'update the knowledge', 'document this codebase', 'is the documentation still accurate', or asks where something lives."
license: MIT
metadata:
  author: CodewithVeek
  version: "1.0.0"
  homepage: "https://github.com/CodewithVeek/skills"
---

# Knowledge graph

A knowledge graph is `docs/knowledge-graph/`: **one file per piece of
knowledge**, an index that gives them a reading order, and a footer on each page
that links to the previous and next one. It is the map a person or an agent
reads before touching the codebase.

It is worth having only while it is true. Everything here serves that.

The tooling is `scripts/kg.mjs`, next to this file. No dependencies, Node 18+.
Point `KG` at it once — this skill's own directory, wherever your agent
installed it (`~/.claude/skills/knowledge-graph/scripts/kg.mjs` for a manual
Claude Code install) — then run it from anywhere inside the repo. It finds the
repo root and the graph by itself, and takes `--dir` when the graph lives
somewhere unusual:

```bash
node $KG check          # structure, links, covered paths, footers
node $KG stale          # docs whose code has moved on since
node $KG nav --write    # rebuild previous/next footers from the index
node $KG map --gaps src # what each doc covers, and what nothing covers
```

If that path is awkward to reach — a sandbox, CI, a teammate's machine — copy
`kg.mjs` into the repo as `scripts/kg.mjs` and commit it. It is one
self-contained file and behaves the same from either place.

## 1. Read it before exploring

In a repo that has a graph, read `docs/knowledge-graph/README.md` first, then
the two or three pages covering the area you are about to work in. It is faster
and more accurate than re-deriving the structure from the source, and it tells
you what has already been tried.

Treat it as a map, not as truth: the code wins every disagreement. When a page
turns out to be wrong, fix it there and then — that is the whole mechanism by
which it stays trustworthy.

## 2. Update it after every piece of work

Whenever a task changes the repo, finish it by updating the graph. Not later,
not in a follow-up: in the same change.

1. Ask which pages the work touched. `kg.mjs map` shows which page covers which
   source path, and `kg.mjs stale` names pages whose code has moved on.
2. Edit them. New feature, new module, new command or new table with no page of
   its own → add a page and link it from the index.
3. `kg.mjs nav --write` if you added, removed or reordered a page.
4. `kg.mjs check` before you finish.
5. Say in your final message which pages you updated.

A change that only refactors internals may leave every page true. Confirm that,
then say so — it is a real answer.

## 3. The page contract

Each page: a title, then what it is, how it works, where it lives (links to
code), how to run it, how to test it. Tables over paragraphs. Roughly 40–150
lines — past that, split it.

Full template and conventions: [references/page-contract.md](references/page-contract.md).

Every page declares the code it covers, in a comment that stays invisible when
the page renders:

```markdown
<!-- kg:covers
src/lib/webhook-handler.ts
src/api/webhook/
-->
```

That block is what makes staleness detectable. A page about no particular code
(a glossary, a roadmap) declares `<!-- kg:covers none -->`.

## 4. Rules that keep it trustworthy

- **Verify before you write.** Open the file, read the function. Never carry a
  claim over from another document, an older version of a page, or memory.
- **No line numbers, no pasted code bodies.** They rot fastest. Link the file
  and name the symbol.
- **One home per fact.** Everything else links to it. Where a fact must also
  appear elsewhere (a README for outsiders), the page says which is updated
  first.
- **Mark what you could not check.** Anything observed from outside the repo —
  what an API answered, what a dashboard showed — is written as observed, with
  the date. Anything assumed is written as assumed, with what happens if the
  assumption is wrong.
- **Don't restate the code.** If a well-named module says it better, link it.
  Document the things source cannot say: why it works this way, what it
  protects against, what happens when it fails, how to run and test it.
- **Write for the next engineer**, not for the person who just did the work.

## 5. Navigation

The index's link order *is* the reading order, and the footers are generated
from it, so reordering the index and running `kg.mjs nav --write` reorders the
whole thing. Order the index so it reads like a series: orientation first
(index, repository map, glossary), then features, then the cross-cutting parts,
then how to run, test, operate and release it.

## 6. When there is no graph yet

Bootstrap it: [references/bootstrap.md](references/bootstrap.md). Survey the
repo, agree the page list, write the index first, then fill the pages in.

## 7. Checking it is still true

`kg.mjs check` and `kg.mjs stale` are cheap and catch structural rot; run them
freely. They cannot tell you whether a sentence is a lie.

For that, run a deep verification pass — subagents fact-checking every claim
against the source, adversarially:
[references/deep-verification.md](references/deep-verification.md). It costs
real tokens, so do it when asked, before a release, or after writing a batch of
pages. On the project this skill came out of, the first pass found 41 errors in
18 freshly written pages, five of them flatly wrong.

Verification reports findings; **you** decide. Check a finding against the
source before acting on it — subagents are wrong too.
