# Skills by CodewithVeek

Agent Skills following the open [agentskills.io](https://agentskills.io) standard. Works with Claude Code, Claude.ai, OpenAI Codex, Cursor, Gemini CLI, GitHub Copilot, and other compatible agents.

| Skill | What it does |
| --- | --- |
| [`learn-simply`](skills/learn-simply) | Explains any topic in plain, unambiguous language using Simplified Technical English rules |

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

## Contributing

Issues and pull requests welcome. If an explanation the skill produced was still confusing, open an issue with the topic and the output — that's the most useful bug report for a skill like this.

## License

MIT — see [LICENSE](LICENSE).
