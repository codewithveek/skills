---
name: learn-simply
description: "Explain any topic the user wants to learn in simple, relatable terms using ASD-STE100 (Simplified Technical English) principles. Use this skill whenever the user says they want to learn, understand, or 'get' something, asks 'what is X', 'how does X work', 'explain X', 'break down X', 'ELI5', or 'teach me X' — for any subject, from programming and databases to finance, science, business, or everyday concepts. Trigger it even when the user does not say 'simply' or 'learning'; a request to understand a concept is enough."
license: MIT
metadata:
  author: CodewithVeek
  version: "1.0.0"
  homepage: "https://github.com/CodewithVeek/skills"
---

# Learn Simply

Turn any topic into an explanation the user can understand on the first read. The writing follows the spirit of ASD-STE100 (Simplified Technical English), a controlled-language standard built to make technical text unambiguous for readers who are not experts.

## Core writing rules

These rules apply to every explanation this skill produces:

1. **One idea per sentence.** If a sentence carries two ideas, split it.
2. **Short sentences.** Aim for under 20 words. Under 25 is acceptable for descriptive text.
3. **Active voice.** "The server checks the token", not "the token is checked by the server".
4. **Simple, common words.** Prefer "use" over "utilize", "start" over "initiate", "enough" over "sufficient". When a simple word exists, the fancy one is banned.
5. **Define every technical term the first time it appears.** One short sentence, in plain words, immediately after (or in) the sentence that introduces it. Never assume the reader knows jargon.
6. **One meaning per word.** Use the same word for the same thing throughout. Do not call it a "token" in one paragraph and a "credential" in the next.
7. **Concrete over abstract.** Ground every abstract idea in a real, relatable example. Draw from the user's own world first — their domain, their tools, the place they live — and from ordinary daily life second. If you know nothing about them, use examples that need no local knowledge to follow.
8. **Short paragraphs.** No more than 3–4 sentences per paragraph. White space is a feature.

## Adaptive strictness

Match the strictness of the rules to the difficulty of the topic:

- **Familiar or light topics** (things adjacent to what the user already knows): apply the STE spirit — short, active, one-idea sentences — but let the prose breathe naturally. A little personality is fine.
- **Complex or unfamiliar topics** (distributed systems internals, cryptography, economics mechanisms, anything with many moving parts): tighten up. Enforce the sentence limits strictly. Slow down. Introduce one concept at a time, and do not introduce a new term until the previous one has landed. Use numbered sequences for any process.

If you are unsure which mode fits, start strict. It is easier to read than necessary than to be lost.

## Explanation structure

Use this layered structure by default. Write it as flowing prose with light headers — do not bullet-point the whole thing.

1. **The core idea (2–4 sentences).** What is this thing, in the plainest possible terms? A reader should get the essence from this paragraph alone, even if they stop reading here.
2. **The analogy.** One relatable comparison that maps the concept onto something the user already knows. Pick analogies with an honest mapping — then say where the analogy breaks, in one sentence, so it does not mislead.
3. **How it actually works.** Now the real detail, still in STE-style sentences. Introduce terms one at a time, each with its plain-word definition. For processes, walk through the steps in order. For structures, describe the parts, then how they connect. This section carries the practitioner-level substance — simplifying the language never means dumbing down the content.
4. **Quick Q&A recap.** Close with 3–5 short question-and-answer pairs. Each question is one the learner would naturally ask ("So what happens if the token expires?"). Each answer is 1–3 sentences. This doubles as a self-test and a summary.

Adjust the depth of section 3 to the request: a quick "what is X" gets a lighter pass; "teach me X" or "I want to learn X" gets the full treatment, and for large topics, offer to continue into sub-topics rather than dumping everything at once.

## Things to avoid

- Aphorisms, dense metaphor-stacking, and "clever" framing. Clarity beats style.
- Wall-of-bullets output. Bullets are for genuine lists (steps, parts), not for prose.
- Filler openings like "Great question!" or long preambles. Start with the core idea.
- Undefined acronyms. Expand every acronym on first use, then use the short form.
- Analogies that flatter but mislead. If the mapping is weak, drop it and pick another.
- Losing accuracy to simplicity. If a simplification is technically a lie, flag it: "This is a simplification — the full picture adds X."

## When the topic is very large

If the user asks to learn something broad ("teach me distributed systems"), do not compress the whole field into one reply. Give the core idea and a map of 4–6 sub-topics in learning order, teach the first one using the structure above, and ask which one to do next. Learning works in layers; respect that.

## Reference

For the fuller list of STE-derived rules with examples of rewrites (before/after sentences), read `references/ste-rules.md`. Consult it when producing a strict-mode explanation or when unsure how to simplify a stubborn sentence.
