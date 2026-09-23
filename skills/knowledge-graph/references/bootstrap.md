# Bootstrapping a graph

For a repo with no `docs/knowledge-graph/` yet.

## 1. Survey before deciding the pages

Read enough to know what the repo actually contains: entry points, the
top-level source folders, routes and jobs, data models and migrations, scripts,
package manifests, the existing README, and the test folder. In a repo of any
size, send parallel subagents at separate areas and have each report what is
there, not what it thinks of it.

Look for the things that are nowhere written down — how to run it, what breaks
in production, what a third-party service actually does. Those pages are worth
more than a tour of the module tree.

## 2. Agree the page list

Propose the list (see the usual set in
[page-contract.md](./page-contract.md)) and the reading order, and let the user
correct it before you write. Cheap to change now, expensive later.

One page per feature the repo *has*, not per folder it contains. Two folders
serving one feature are one page; one folder serving three features is three.

## 3. Write the index first

`README.md`: what the folder is, the update rule, the table of pages in reading
order, the diagram if one helps. Writing it first forces the shape to be
decided before any prose is spent, and gives the user something to react to.

## 4. Fill the pages in

Each page against the source, never from the index's description of it. Include
the `kg:covers` block as you go — it is far cheaper now than reconstructed
later.

Where the repo already documents something well (a README's setup steps), link
it rather than copying, and say which one is updated first.

## 5. Wire it up

- `kg.mjs nav --write` — the previous/next footers.
- `kg.mjs check` — index, links, covered paths.
- `kg.mjs map --gaps <src roots>` — what no page covers. Each gap is either a
  missing page or a deliberate omission; decide each one.
- Link the folder from the repo's main README so people find it.

## 6. Verify before you hand it over

Run [deep verification](./deep-verification.md) on what you wrote. Pages
written in one sitting contain more errors than anyone expects — mostly
plausible sentences about code that works slightly differently.

## Scale

A small repo may deserve four pages; a large one thirty. The test is whether a
new engineer can find the answer without reading source they did not need to
read. Adding pages nobody reads costs more than it looks: every one of them is
another thing that can quietly go out of date.
