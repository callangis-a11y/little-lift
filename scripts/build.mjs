// Builds the live website into dist/ from src/app.html, content/ and public/.
// Usage: node scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const app = readFileSync(join(root, "src/app.html"), "utf8");
const title = (app.match(/<title>([^<]*)<\/title>/) || [, "Little Lift"])[1];

// Public address of the live site (link previews need a full URL).
const SITE = "https://callangis-a11y.github.io/little-lift/";

const head = `<!doctype html>
<html lang="en-AU" data-site="1">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="A little lift, any time. A free, private wellbeing app with support lines, daily check-ins, games and practical guides.">
<meta name="theme-color" content="#FFF8F4" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#101924" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="${title}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="A little lift, any time. Free, private wellbeing tools for everyone. No download, no sign-up.">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Little Lift">
<meta property="og:url" content="${SITE}">
<meta property="og:image" content="${SITE}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Little Lift logo with the words: A little lift, any time. Free, private wellbeing tools for everyone.">
<meta property="og:locale" content="en_AU">
<meta name="twitter:card" content="summary_large_image">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<style>body{margin:0}img{max-width:100%}</style>
</head>
<body>
`;
const html = head + app.replace(/<title>[^<]*<\/title>\s*/, `<title>${title}</title>\n`) + "\n</body>\n</html>\n";
writeFileSync(join(dist, "index.html"), html);

cpSync(join(root, "content"), join(dist, "content"), { recursive: true });
cpSync(join(root, "public"), dist, { recursive: true });

// Service worker: version = hash of everything shipped, so each publish refreshes caches.
const files = [];
(function walk(dir, rel = "") {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f), r = rel ? `${rel}/${f}` : f;
    if (statSync(p).isDirectory()) walk(p, r); else if (f !== "sw.js") files.push(r);
  }
})(dist);
const hash = createHash("sha256");
for (const f of files.sort()) hash.update(f).update(readFileSync(join(dist, f)));
const version = hash.digest("hex").slice(0, 12);
const sw = readFileSync(join(root, "public/sw.js"), "utf8")
  .replace("__VERSION__", version)
  .replace("__PRECACHE__", JSON.stringify(["./", ...files.filter(f => !f.startsWith("content/") && f !== "og.png")]));
writeFileSync(join(dist, "sw.js"), sw);

console.log(`Built dist/ (${files.length + 1} files, version ${version})`);
