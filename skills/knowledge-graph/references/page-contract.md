# The page contract

One page, one piece of knowledge. If a page needs "and" in its title, it is
probably two pages.

## Shape

```markdown
<!-- kg:covers
src/lib/thing.ts
src/api/thing/
-->

# Thing

**What.** One or two sentences: what it does, for whom.

**Where.** [`src/lib/thing.ts`](../../src/lib/thing.ts), plus the helpers that
matter. Link every file named.

## How it works

The three to six things a reader must know: the order steps run in, what is
guarded against what, what happens when it fails. Tables when the content is a
list of cases.

## Gotchas          (only when there are any)

What surprised the last person. Why it is this way and not the obvious way.

**Run.** The command, or the click path.

**Test.** The test files, and what a person checks by hand.

<!-- kg:nav -->

---

← Previous: [Thing before](./thing-before.md)  ·  [Index](./README.md)  ·  Next: [Thing after](./thing-after.md) →
```

`Run` and `Test` are dropped when they make no sense (a glossary has neither).
The `kg:nav` footer is generated — never hand-write it; run `kg.mjs nav --write`.

## Length

40–150 lines. Under 40, it probably belongs inside a neighbouring page. Over
150, it is holding two subjects; `kg.mjs check` warns past 170.

## Links

- To code: relative from the page — `../../src/lib/thing.ts`. Link the file,
  name the symbol in prose, and never cite a line number.
- To other pages: `./other-page.md`, with the page's own title as the link text.
- Escape brackets in paths for markdown: a file at `api/[id]/route.ts` becomes
  `../../src/api/%5Bid%5D/route.ts`.

## Naming

Kebab-case, named for the subject, not its layer: `webhooks.md`, not
`lib-webhook-handler.md`. A reader looking for "how do payments get captured"
should be able to guess the filename.

## The index

`README.md` holds: one line saying what the folder is, the rule that it is
updated after every piece of work, a table of every page with a one-line
description, and — where it helps — one diagram of how the parts connect. The
order of the table is the reading order.

## A usual set of pages

Not a template to fill in blindly; the shape most repos land on.

| Page | Holds |
| --- | --- |
| `README.md` | Index, the one diagram, the two or three rules that explain the design |
| `repository-map.md` | Folders, apps, what each is for, build and load order |
| `glossary.md` | The terms every other page uses |
| `configuration.md` | Options, env vars, what is validated at boot |
| one per feature | The real content: a feature, a subsystem, a surface |
| `data-model.md` | Tables, stored shapes, events |
| `error-codes.md` | Every code a caller can get back, and what to do about it |
| `running-locally.md` | Commands to get it up, and the traps |
| `testing.md` | What is tested, how, and what is not |
| `operations.md` | Going live, what to watch, what to do when it breaks |
| `releasing.md` | How a change becomes a version |
| `roadmap.md` | What is done, what is next, what is deliberately not done |
| `<external>-api-notes.md` | What a third-party API actually does, observed, with dates |

Pages that record observations (the last row) matter more than they look: they
are where the expensive lessons live, and nothing else in the repo holds them.

## What does not belong

- Anything the code says better — link it instead.
- Line numbers, copied function bodies, generated API listings.
- Secrets, keys, tokens, internal URLs with credentials.
- Task status and TODOs (except a roadmap page's milestones).
- Wishful documentation: what the code *should* do. Write what it does; put the
  rest on the roadmap.
