// Opens the built site in a headless browser and checks the essentials work.
// Usage: node scripts/build.mjs && node scripts/smoke.mjs
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright";

const dist = new URL("../dist", import.meta.url).pathname;
const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png", ".svg": "image/svg+xml" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
  const f = join(dist, p);
  if (!f.startsWith(dist) || !existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": types[extname(f)] || "application/octet-stream" }); res.end(readFileSync(f));
}).listen(0);
const base = `http://localhost:${server.address().port}/`;

const fail = [];
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 375, height: 800 } });
page.on("pageerror", e => fail.push("Script error: " + e.message));
await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await page.goto(base);
await page.waitForTimeout(800);

await page.click("#helpBtn");
const lines = await page.$$eval("#linesSheet .li", x => x.length);
if (lines < 4) fail.push(`Help sheet shows ${lines} support lines (expected at least 4)`);
if (!(await page.$('#helpSheet a[href="tel:000"]'))) fail.push("Call 000 button missing");
await page.keyboard.press("Escape");

for (const [route, sel, min] of [["support", "#svcList .li", 1], ["involved", "#eventList .card", 1], ["guide-move", "#partnersList .li", 0]]) {
  await page.goto(base + "#" + route); await page.waitForTimeout(400);
  const n = await page.$$eval(sel, x => x.length);
  if (n < min) fail.push(`#${route}: expected content in ${sel}, found ${n}`);
}
for (const r of ["today", "toolkit", "tool-flip", "tool-smile", "tool-boost", "tool-jar", "tool-breathe", "tool-ground", "tool-wave", "tool-kind", "tool-worry", "tool-solve", "tool-brave", "tool-values", "tool-connect", "tool-plan", "guides", "guide-mate", "guide-move", "guide-adhd", "guide-system", "guide-money", "guide-young", "guide-grief", "support", "involved"]) {
  await page.goto(base + "#" + r); await page.waitForTimeout(150);
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) fail.push(`#${r} scrolls sideways on a phone`);
}
// Offline: once opened, the app (and its support lines) must work without signal.
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
  const off = await ctx.newPage();
  off.on("pageerror", e => fail.push("Script error (offline test): " + e.message));
  await off.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await off.goto(base);
  const ready = await off.evaluate(() => Promise.race([navigator.serviceWorker.ready.then(() => true), new Promise(r => setTimeout(() => r(false), 8000))]));
  if (!ready) fail.push("Offline support (service worker) didn't start");
  else {
    await off.reload(); await off.waitForTimeout(500);
    await ctx.setOffline(true);
    try {
      await off.reload(); await off.waitForTimeout(800);
      await off.click("#helpBtn");
      const n = await off.$$eval("#linesSheet .li", x => x.length);
      if (n < 4) fail.push(`Offline: help sheet shows ${n} support lines`);
    } catch (e) { fail.push("Offline: app didn't open without signal (" + e.message.split("\n")[0] + ")"); }
  }
  await ctx.close();
}
await browser.close(); server.close();
if (fail.length) { fail.forEach(f => console.error("Problem: " + f)); process.exit(1); }
console.log("Smoke test passed.");
