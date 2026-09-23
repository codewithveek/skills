# Skills by CodewithVeek

Agent Skills following the open [agentskills.io](https://agentskills.io) standard. Works with Claude Code, Claude.ai, OpenAI Codex, Cursor, Gemini CLI, GitHub Copilot, and other compatible agents.

| Skill | What it does |
| --- | --- |
| [`learn-simply`](skills/learn-simply) | Explains any topic in plain, unambiguous language using Simplified Technical English rules |
| [`knowledge-graph`](skills/knowledge-graph) | Maps a codebase — one page per feature — and tells you when a page has fallen behind the code |

---

## learn-simply

Most AI explanations are fluent and unclear at the same time. They stack metaphors, use a fancy word where a plain one exists, introduce three terms in one sentence, and leave you re-reading the paragraph.

`learn-simply` applies the writing rules from **ASD-STE100 (Simplified Technical English)** — a controlled-language standard built so that technical text reads unambiguously for non-experts — to explanations. One idea per sentence. Active voice. Every term defined the moment it appears. One word for one thing, all the way through.

It does not dumb the content down. It removes the friction between the content and your head.

### What changes

**Without the skill:**

> JWTs are signed tokens that the server issues after authentication and that the client subsequently transmits on every request, enabling the server to validate identity statelessly without requiring a database lookup.

**With the skill:**

> A JWT is a signed token. The server creates it after you log in. The client sends it back with every request. The signature lets the server confirm who you are without a database lookup.

Same information. One of them you read once.

### How it behaves

- **Adaptive strictness.** Familiar topics get the STE spirit with room to breathe. Hard topics (distributed systems, cryptography, economics) get the rules enforced tightly — one concept at a time, nothing new introduced until the last thing landed.
- **A four-layer structure.** Core idea → an analogy with its breaking point stated → how it actually works → a short Q&A recap that doubles as a self-test.
- **Honest analogies.** Every analogy is checked for whether it would predict something false if you extended it. If it would, the skill tells you where it breaks.
- **Flagged simplifications.** If a simplification is technically a lie, it says so rather than letting you walk away with a wrong model.
- **Layered for big topics.** Ask it to teach you a whole field and it gives you a map plus the first sub-topic, not a compressed dump.

### Install

**Claude Code** (as a plugin):

```
/plugin marketplace add CodewithVeek/skills
/plugin install learn-simply@codewithveek
```

**Any agent** (via the skills CLI):

```bash
npx skills add CodewithVeek/skills
```

**Manually** — copy the skill folder into your agent's skills directory:

```bash
git clone https://github.com/CodewithVeek/skills.git
cp -r skills/skills/learn-simply ~/.claude/skills/      # Claude Code
cp -r skills/skills/learn-simply ~/.codex/skills/        # OpenAI Codex
```

**Claude.ai** — zip the `skills/learn-simply` folder and upload it under Settings → Capabilities → Skills.

### Use it

You mostly don't have to. The skill triggers on its own when you ask to learn or understand something:

```
explain how database indexes actually work
teach me consensus algorithms
what is a CDN
ELI5 how interest rates move currencies
```

To force it in Claude Code: `/learn-simply:learn-simply`

### What's inside

```
skills/learn-simply/
├── SKILL.md                    # Rules, structure, and adaptive strictness
└── references/
    └── ste-rules.md            # Full rule list with before/after rewrites,
                                # loaded on demand for strict-mode explanations
```

The reference file is loaded only when the agent needs it, so the skill costs almost nothing in context until it's actually working.

---

## knowledge-graph

Documentation rots quietly. Nothing tells you which page stopped being true, so people stop trusting all of it, and then nobody updates any of it.

`knowledge-graph` keeps a codebase's knowledge as a folder of small pages — one per feature — with an index that sets the reading order, previous/next links at the bottom of every page, and one piece of metadata per page: the source it describes.

```markdown
<!-- kg:covers
src/lib/webhook-handler.ts
src/api/webhook/
-->
```

That comment stays invisible when the page renders, and it is what lets tooling answer the question documentation can never answer about itself: **what is out of date right now?**

### The commands

One file, no dependencies, Node 18+.

| Command | Answers |
| --- | --- |
| `node $KG check` | Is every page in the index and every indexed page real, do all links resolve, do the covered paths exist, are the footers current? |
| `node $KG stale` | Which pages have had commits to their code since the page itself last changed — and which commits were they? |
| `node $KG nav --write` | Rebuild every previous/next footer from the index's order |
| `node $KG map --gaps src` | What does each page cover — and which code files does nothing cover? |

### How it behaves

- **Reads before exploring.** In a repo that has a graph, the agent reads the index and the pages for the area first. Cheaper than re-deriving the structure every session, and it carries the lessons that are not in the code.
- **Updates as part of the work.** At the end of any change: which pages does this touch, edit them, regenerate the navigation, run the check. Not a follow-up task that never happens.
- **Verifies before it writes.** Claims get checked against the source, never carried over from another document. For a batch of pages there is a deep pass — subagents fact-checking every claim adversarially, plus one hunting for what is missing. On the project this skill came out of, that pass found 41 errors in 18 freshly written pages.
- **Fixes the code when the code is the problem.** A verification pass that only ever edits prose is missing half of what it finds: a log level that contradicts what the docs promise is a bug, not a documentation error.
- **Bootstraps a repo that has none.** Survey, agree the page list, write the index first, then fill it in.

### Install

**Claude Code** (as a plugin):

```
/plugin marketplace add CodewithVeek/skills
/plugin install knowledge-graph@codewithveek
```

**Any agent** (via the skills CLI):

```bash
npx skills add CodewithVeek/skills
```

**Manually**:

```bash
git clone https://github.com/CodewithVeek/skills.git
cp -r skills/skills/knowledge-graph ~/.claude/skills/     # Claude Code
cp -r skills/skills/knowledge-graph ~/.codex/skills/      # OpenAI Codex
```

### Use it

```
document this codebase
update the knowledge graph
is the documentation still accurate?
what has gone stale?
where does payment capture actually happen?
```

To force it in Claude Code: `/knowledge-graph:knowledge-graph`

### What's inside

```
skills/knowledge-graph/
├── SKILL.md                        # When to read it, when to update it, the rules
├── references/
│   ├── page-contract.md            # Page template, naming, what does not belong
│   ├── bootstrap.md                # Starting a graph in a repo that has none
│   └── deep-verification.md        # Fact-checking every claim against the source
└── scripts/
    └── kg.mjs                      # check · stale · nav · map
```

The reference files load only when that part of the job comes up, so the skill stays cheap until it is actually working.

## Contributing

Issues and pull requests welcome. If an explanation the skill produced was still confusing, open an issue with the topic and the output — that's the most useful bug report for a skill like this.

## License

MIT — see [LICENSE](LICENSE).
