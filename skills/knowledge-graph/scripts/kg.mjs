#!/usr/bin/env node
// Knowledge-graph tooling. No dependencies. Node >= 18.
//
//   node kg.mjs check [--dir <path>] [--max-lines 170]   structure, links, covers paths, footers
//   node kg.mjs stale [--dir <path>]                     docs whose code moved on since
//   node kg.mjs map   [--dir <path>] [--gaps <roots>]    what each doc covers, and what nothing covers
//   node kg.mjs nav   [--dir <path>] [--write]           rebuild the previous/next footers from the index
//
// A doc declares the source it covers with an HTML comment, so it stays
// invisible when the page renders:
//
//   <!-- kg:covers
//   src/lib/webhook-handler.ts
//   src/api/webhook/
//   -->
//
// Use `<!-- kg:covers none -->` for a doc that describes no particular code
// (a glossary, a roadmap).

import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const CODE_FILE = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|rb|java|kt|php|swift|sql)$/
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", ".medusa", "coverage", ".next", "out", "vendor", "__pycache__"])
const DEFAULT_DIRS = ["docs/knowledge-graph", "knowledge-graph", "docs/knowledge", ".knowledge-graph"]

const args = process.argv.slice(2)
const command = args[0] ?? "check"
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 || !args[i + 1] || args[i + 1].startsWith("--") ? fallback : args[i + 1]
}

function git(argv, cwd) {
  try {
    return execFileSync("git", argv, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
  } catch {
    return ""
  }
}

const repoRoot = git(["rev-parse", "--show-toplevel"], process.cwd()) || process.cwd()

function resolveDir() {
  const asked = flag("dir")
  const candidates = asked ? [asked] : DEFAULT_DIRS
  for (const candidate of candidates) {
    const abs = path.resolve(repoRoot, candidate)
    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
      return abs
    }
  }
  console.error(
    asked
      ? `No knowledge graph at ${asked}.`
      : `No knowledge graph found (looked for ${DEFAULT_DIRS.join(", ")}). Pass --dir.`
  )
  process.exit(2)
}

const dir = resolveDir()
const rel = (abs) => path.relative(repoRoot, abs).split(path.sep).join("/")

function docs() {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(dir, f))
}

/**
 * Markdown with fenced blocks and inline code removed. A page that shows an
 * example link or an example covers block is documenting, not declaring.
 */
function prose(file) {
  return fs
    .readFileSync(file, "utf8")
    .replace(/^```[\s\S]*?^```/gm, "")
    .replace(/`[^`\n]*`/g, "")
}

function readCovers(file) {
  const text = prose(file)
  const match = text.match(/<!--\s*kg:covers([\s\S]*?)-->/)
  if (!match) {
    return { declared: false, paths: [], none: false }
  }
  const body = match[1].trim()
  if (/^none$/i.test(body)) {
    return { declared: true, paths: [], none: true }
  }
  const paths = body
    .split(/[\n,]/)
    .map((line) => line.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean)
  return { declared: true, paths, none: false }
}

function relativeLinks(file) {
  return [...prose(file).matchAll(/\]\(([^)\s]+?)(?:#[^)]*)?\)/g)]
    .map((m) => decodeURIComponent(m[1]))
    .filter((target) => !/^(https?:|mailto:|#)/.test(target))
}

function indexFile() {
  for (const name of ["README.md", "index.md"]) {
    const abs = path.join(dir, name)
    if (fs.existsSync(abs)) return abs
  }
  return undefined
}

const NAV_MARKER = "<!-- kg:nav -->"

/** The reading order is the order the index links the files in. */
function readingOrder() {
  const index = indexFile()
  if (!index) return []
  const seen = new Set()
  const order = []
  for (const match of prose(index).matchAll(/\]\(\.\/([^)\s]+\.md)\)/g)) {
    const name = match[1]
    if (!seen.has(name) && fs.existsSync(path.join(dir, name))) {
      seen.add(name)
      order.push(name)
    }
  }
  return order
}

function titleOf(file) {
  const heading = fs.readFileSync(file, "utf8").match(/^#\s+(.+)$/m)
  return heading ? heading[1].trim() : path.basename(file, ".md")
}

/** The footer that turns the folder into something you can read straight through. */
function navFooter(order, position) {
  const indexName = path.basename(indexFile() ?? "README.md")
  const link = (name) => `[${titleOf(path.join(dir, name))}](./${name})`
  const parts = []
  if (position > 0) parts.push(`← Previous: ${link(order[position - 1])}`)
  parts.push(`[Index](./${indexName})`)
  if (position < order.length - 1) parts.push(`Next: ${link(order[position + 1])} →`)
  return `${NAV_MARKER}\n\n---\n\n${parts.join("  ·  ")}\n`
}

function withFooter(file, footer) {
  const text = fs.readFileSync(file, "utf8")
  const at = text.indexOf(NAV_MARKER)
  const body = (at === -1 ? text : text.slice(0, at)).replace(/\s+$/, "")
  return `${body}\n\n${footer}`
}

/** Files whose footer is missing or no longer matches the index order. */
function navDrift() {
  const order = readingOrder()
  const drift = []
  order.forEach((name, position) => {
    const file = path.join(dir, name)
    const wanted = withFooter(file, navFooter(order, position))
    if (fs.readFileSync(file, "utf8") !== wanted) {
      drift.push({ name, file, wanted })
    }
  })
  return drift
}

function nav() {
  const drift = navDrift()
  if (!drift.length) {
    console.log("Every page already links to the one before and after it.")
    return
  }
  if (!args.includes("--write")) {
    console.log(`${drift.length} page(s) need their footer rebuilt:`)
    for (const item of drift) console.log(`   ${item.name}`)
    console.log("\nRun with --write to fix them.")
    return
  }
  for (const item of drift) {
    fs.writeFileSync(item.file, item.wanted)
    console.log(`   rebuilt ${item.name}`)
  }
  console.log(`${drift.length} footer(s) rebuilt from the index order.`)
}

function check() {
  const problems = []
  const warnings = []
  const maxLines = Number(flag("max-lines", "170"))
  const all = docs()

  if (!all.length) {
    problems.push(`${rel(dir)} has no markdown files.`)
  }

  const index = indexFile()
  if (!index) {
    problems.push(`${rel(dir)} has no README.md index.`)
  } else {
    const listed = new Set([...prose(index).matchAll(/\]\(\.\/([^)\s]+\.md)\)/g)].map((m) => m[1]))
    for (const file of all) {
      const name = path.basename(file)
      if (name !== path.basename(index) && !listed.has(name)) {
        problems.push(`${name} is not in the index.`)
      }
    }
    for (const name of listed) {
      if (!fs.existsSync(path.join(dir, name))) {
        problems.push(`the index links ${name}, which does not exist.`)
      }
    }
  }

  let linkCount = 0
  for (const file of all) {
    for (const target of relativeLinks(file)) {
      linkCount++
      if (!fs.existsSync(path.resolve(path.dirname(file), target))) {
        problems.push(`${path.basename(file)} links ${target}, which does not exist.`)
      }
    }

    const { declared, paths, none } = readCovers(file)
    if (!declared && file !== index) {
      warnings.push(`${path.basename(file)} declares no kg:covers block.`)
    }
    for (const covered of paths) {
      if (!fs.existsSync(path.resolve(repoRoot, covered))) {
        problems.push(`${path.basename(file)} covers ${covered}, which does not exist.`)
      }
    }
    if (none && paths.length) {
      problems.push(`${path.basename(file)} says covers "none" and also lists paths.`)
    }

    const lines = fs.readFileSync(file, "utf8").split("\n").length
    if (lines > maxLines) {
      warnings.push(`${path.basename(file)} is ${lines} lines (over ${maxLines}) — consider splitting it.`)
    }
  }

  for (const item of navDrift()) {
    problems.push(`${item.name} has no previous/next footer, or one the index no longer agrees with — run \`kg.mjs nav --write\`.`)
  }

  console.log(`${all.length} files, ${linkCount} relative links, in ${rel(dir)}`)
  for (const warning of warnings) console.log(`  warn  ${warning}`)
  for (const problem of problems) console.log(`  FAIL  ${problem}`)
  if (!problems.length) console.log(warnings.length ? "No errors." : "All good.")
  process.exit(problems.length ? 1 : 0)
}

function stale() {
  if (!git(["rev-parse", "--is-inside-work-tree"], repoRoot)) {
    console.error("Not a git repository, so staleness cannot be judged.")
    process.exit(2)
  }

  const rows = []
  for (const file of docs()) {
    const { paths, none } = readCovers(file)
    if (none || !paths.length) continue

    const lastDocCommit = git(["log", "-1", "--format=%H", "--", rel(file)], repoRoot)
    if (!lastDocCommit) {
      rows.push({ doc: path.basename(file), uncommitted: true, commits: [] })
      continue
    }

    const since = git(
      ["log", `${lastDocCommit}..HEAD`, "--format=%h%s", "--", ...paths],
      repoRoot
    )
    const commits = since
      ? since.split("\n").map((line) => {
          const [hash, subject] = line.split("")
          return { hash, subject }
        })
      : []
    if (commits.length) {
      rows.push({ doc: path.basename(file), commits, covers: paths })
    }
  }

  const uncommitted = rows.filter((r) => r.uncommitted)
  const behind = rows.filter((r) => !r.uncommitted).sort((a, b) => b.commits.length - a.commits.length)

  if (!behind.length && !uncommitted.length) {
    console.log("Every doc is at least as new as the code it covers.")
    return
  }

  for (const row of behind) {
    console.log(`\n${row.doc} — ${row.commits.length} commit(s) to its code since it last changed`)
    for (const commit of row.commits.slice(0, 5)) {
      console.log(`   ${commit.hash}  ${commit.subject}`)
    }
    if (row.commits.length > 5) console.log(`   … and ${row.commits.length - 5} more`)
  }
  for (const row of uncommitted) {
    console.log(`\n${row.doc} — not committed yet, so nothing to compare.`)
  }
  console.log("\nRead each one and update it, or confirm the change did not affect what it says.")
}

function walk(root, out = []) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || SKIP_DIRS.has(entry.name)) continue
    const abs = path.join(root, entry.name)
    if (entry.isDirectory()) walk(abs, out)
    else if (CODE_FILE.test(entry.name)) out.push(abs)
  }
  return out
}

function map() {
  const covered = []
  for (const file of docs()) {
    const { paths, none } = readCovers(file)
    if (none) continue
    if (paths.length) {
      console.log(`${path.basename(file)}`)
      for (const p of paths) console.log(`   ${p}`)
      covered.push(...paths)
    }
  }
  console.log(`\n${covered.length} paths covered.`)

  const gapRoots = flag("gaps")
  if (!gapRoots) return

  const normalized = covered.map((p) => p.replace(/\/+$/, ""))
  const gaps = []
  for (const root of gapRoots.split(",").map((r) => r.trim()).filter(Boolean)) {
    const abs = path.resolve(repoRoot, root)
    if (!fs.existsSync(abs)) continue
    for (const file of walk(abs)) {
      const relative = rel(file)
      const isCovered = normalized.some((c) => relative === c || relative.startsWith(`${c}/`))
      if (!isCovered) gaps.push(relative)
    }
  }
  if (gaps.length) {
    console.log(`\n${gaps.length} code file(s) no doc covers:`)
    for (const gap of gaps.slice(0, 40)) console.log(`   ${gap}`)
    if (gaps.length > 40) console.log(`   … and ${gaps.length - 40} more`)
    console.log("\nEach one is either a gap in the graph, or deliberately not worth a doc.")
  } else {
    console.log("\nEvery code file under those roots is covered by some doc.")
  }
}

const commands = { check, stale, map, nav }
if (!commands[command]) {
  console.error(`Unknown command "${command}". Use check, stale, map or nav.`)
  process.exit(2)
}
commands[command]()
