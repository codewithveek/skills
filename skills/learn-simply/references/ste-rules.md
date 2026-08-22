# STE-derived writing rules with rewrite examples

These rules are adapted from the principles of ASD-STE100 (Simplified Technical English) for use in learning explanations. They are summarized in original wording — this is not a reproduction of the standard.

## Sentence rules

**Rule: one instruction or idea per sentence.**
- Before: "JWTs are signed tokens that the server issues after login and that the client sends back on every request so the server can verify identity without a database lookup."
- After: "A JWT is a signed token. The server creates it after you log in. The client sends it back with every request. The signature lets the server confirm who you are without a database lookup."

**Rule: keep sentences under 20 words (25 for descriptive text).**
Count the words. If a sentence goes over, find the "and", "which", or "that" holding two ideas together, and cut there.

**Rule: use active voice.**
- Before: "The request is validated by the middleware before the handler is reached."
- After: "The middleware validates the request before it reaches the handler."

**Rule: use the imperative for instructions.**
- Before: "The user should ensure that the environment variable is set."
- After: "Set the environment variable."

## Word rules

**Rule: choose the simple word.**

| Avoid | Use |
|---|---|
| utilize | use |
| initiate, commence | start |
| terminate | stop, end |
| sufficient | enough |
| approximately | about |
| subsequently | then, after |
| in order to | to |
| facilitate | help, make easier |
| leverage (verb) | use |
| prior to | before |

**Rule: one word, one meaning.**
Pick one name for each concept and keep it for the whole explanation. If you call the auth server the "issuer" once, it stays the "issuer" — not "the provider", "the IdP", and "the auth service" in later paragraphs.

**Rule: expand acronyms on first use.**
- "OTP (a one-time password — a code that works only once)".
After that, use the acronym alone.

## Term-introduction rules

**Rule: define a term in the same breath you introduce it.**
- Before: "TiDB uses Raft for replication."
- After: "TiDB copies your data to several machines. It uses Raft, a protocol the machines follow to agree on the same data even if one of them fails."

**Rule: one new term at a time.**
Never introduce two new terms in the same sentence. If a definition itself needs a second unfamiliar term, define the second term first, in its own sentence.

## Structure rules

**Rule: for any process, use an ordered sequence.**
Steps go in the order they happen, one step per line, each starting with the actor: "1. The client sends the form. 2. The server checks the password. 3. ..."

**Rule: paragraph limit.**
3–4 sentences, then break. A reader's eye needs landing spots.

**Rule: front-load the point.**
The first sentence of any section states the main point. Detail comes after, never before.

## Analogy quality check

Before using an analogy, verify:
1. Does each part of the analogy map to a real part of the concept?
2. Would the analogy predict something false if the learner extended it? If yes, state where it breaks.
3. Is the analogy from the learner's world (software, money movement, everyday life)? Prefer those.

Example of stating the break: "A JWT is like a stamped wristband at an event — the gate staff trust the stamp without calling the office. The analogy breaks in one place: a wristband can be cut off, but a JWT cannot be revoked easily before it expires."
