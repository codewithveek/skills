// Read-only reference screenshots of the running product: the source of truth for every screen a
// video rebuilds. Open dialogs and menus to capture their states, but never confirm, save or delete.
//
//   npm i -D playwright-core && npx playwright-core install chromium   (once; or point BROWSER at a Chromium)
//   APP_URL=http://localhost:3000 node reference/capture.mjs          (ONLY=<substring> to retake some)
//
// Edit LOGINS and SHOTS for the product. Shots land in reference/shots/<name>.png, whole page, at the
// viewport the videos draw on (1440x900 by default, see SCREEN in src/theme.ts).
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const BASE = process.env.APP_URL ?? "http://localhost:3000";
const VIEWPORT = { width: 1440, height: 900 };
const SCHEME = process.env.SCHEME ?? "dark"; // match the theme the videos use
const OUT = new URL("./shots/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

// Who to sign in as, by role. Use demo accounts, never real customers.
const LOGINS = {
  admin: { path: "/sign-in", fields: { "#email": "admin@example.com", "#password": "demo-password" }, submit: "button[type=submit]" },
};

// [name, login role or null for public pages, path, optional action that opens a state]
const SHOTS = [
  ["home", null, "/"],
  ["settings", "admin", "/settings"],
  ["settings-confirm-dialog", "admin", "/settings", async (page) => {
    await page.getByRole("button", { name: "Delete workspace" }).click(); // open only: never press the confirm button
    await page.waitForSelector("dialog[open], [role=dialog]");
  }],
];

const browser = await chromium.launch({ executablePath: process.env.BROWSER, args: ["--no-sandbox"] });
const sessions = {};
for (const [role, login] of Object.entries(LOGINS)) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${BASE}${login.path}`, { waitUntil: "networkidle" });
  for (const [selector, value] of Object.entries(login.fields)) await page.fill(selector, value);
  await Promise.all([page.waitForURL((url) => !url.pathname.startsWith(login.path)), page.click(login.submit)]);
  sessions[role] = await context.storageState();
  await context.close();
}

const problems = [];
for (const [name, role, path, act] of SHOTS) {
  if (process.env.ONLY && !name.includes(process.env.ONLY)) continue;
  const context = await browser.newContext({ viewport: VIEWPORT, colorScheme: SCHEME, ...(role ? { storageState: sessions[role] } : {}) });
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    if (act) {
      await act(page);
      await page.waitForTimeout(400);
    }
    // Whole page without pinning sticky bars: grow the viewport to the page's height first
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ width: VIEWPORT.width, height: Math.max(VIEWPORT.height, height) });
    await page.screenshot({ path: `${OUT}${name}.png` });
    console.log("shot", name);
  } catch (error) {
    problems.push(`${name}: ${error.message.split("\n")[0]}`);
  }
  await context.close();
}
await browser.close();
console.log(problems.length ? `PROBLEMS:\n${problems.join("\n")}` : "all shots taken");
