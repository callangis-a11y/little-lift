// Checks content files and the app before anything is published.
// Any problem here stops the publish, so a typo can't break the live app.
// Usage: node scripts/validate.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const errors = [], warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

const SCHEMA = {
  lines:    { required: ["id", "name", "number"], optional: ["sms", "who", "hours", "url", "order", "hidden"] },
  services: { required: ["id", "name"], optional: ["category", "area", "blurb", "phone", "url", "order", "hidden"] },
  events:   { required: ["id", "title"], optional: ["date", "when", "place", "blurb", "url", "order", "hidden"] },
  partners: { required: ["id", "name"], optional: ["area", "blurb", "phone", "url", "offer", "order", "hidden"] }
};
// Crisis lines the app must always show. The app also has these built in as a safety net.
const CORE = { "131114": "Lifeline", "1300659467": "Suicide Call Back Service", "1300224636": "Beyond Blue", "1800551800": "Kids Helpline" };
const digits = s => String(s ?? "").replace(/\D/g, "");

for (const [kind, rule] of Object.entries(SCHEMA)) {
  const file = `content/${kind}.json`;
  let data;
  try { data = JSON.parse(readFileSync(join(root, file), "utf8")); }
  catch (e) { err(file, `isn't valid JSON (${e.message}). Check for a missing comma, quote or bracket.`); continue; }
  const items = Array.isArray(data) ? data : data.items;
  if (!Array.isArray(items)) { err(file, `needs an "items" list`); continue; }
  const ids = new Set();
  items.forEach((it, i) => {
    const where = `${file} item ${i + 1}${it && it.id ? ` ("${it.id}")` : ""}`;
    if (!it || typeof it !== "object" || Array.isArray(it)) { err(where, "must be an object { ... }"); return; }
    for (const k of rule.required) if (it[k] === undefined || it[k] === "") err(where, `is missing "${k}"`);
    for (const k of Object.keys(it)) if (!rule.required.includes(k) && !rule.optional.includes(k)) warn(where, `has an unknown field "${k}" (it will be ignored)`);
    if (it.id !== undefined) {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(it.id)) err(where, `id should be lowercase letters, numbers and dashes`);
      if (ids.has(it.id)) err(where, `id "${it.id}" is used twice`); ids.add(it.id);
    }
    for (const [k, v] of Object.entries(it)) {
      if (typeof v === "string") {
        if (/<[a-z\/!]/i.test(v)) err(where, `"${k}" contains HTML. Use plain text only.`);
        if (v.length > 400) warn(where, `"${k}" is long (${v.length} characters). Keep it short for phones.`);
      }
    }
    for (const k of ["number", "sms", "phone"]) if (it[k] !== undefined) {
      const d = digits(it[k]);
      if (d.length < 3 || d.length > 12) err(where, `"${k}" doesn't look like an Australian phone number`);
    }
    if (it.url !== undefined && !/^https:\/\/[^\s]+\.[^\s]+/.test(it.url)) err(where, `"url" must start with https://`);
    if (it.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(it.date)) err(where, `"date" must look like 2026-11-14`);
    if (it.order !== undefined && typeof it.order !== "number") err(where, `"order" must be a number (no quotes)`);
    if (it.hidden !== undefined && typeof it.hidden !== "boolean") err(where, `"hidden" must be true or false (no quotes)`);
  });
  if (kind === "lines") {
    for (const [num, name] of Object.entries(CORE)) {
      const it = items.find(x => digits(x.number) === num);
      if (!it) warn(file, `${name} isn't listed. The app will still show it from its built-in list.`);
      else if (it.hidden === true) err(file, `${name} can't be hidden. It's a core crisis line.`);
    }
  }
}

// Guard the app's safety features against accidental code edits.
const app = readFileSync(join(root, "src/app.html"), "utf8");
const mustHave = [["tel:000", "the Call 000 button"], ["13 11 14", "Lifeline"], ['id="helpBtn"', "the Get help now button"], ["CORE_LINES", "the built-in support lines"]];
for (const [needle, what] of mustHave) if (!app.includes(needle)) err("src/app.html", `is missing ${what}`);
if (/<!doctype|<html|<head>|<body/i.test(app)) err("src/app.html", "should not include <!doctype>, <html>, <head> or <body>. The build adds them.");

warnings.forEach(w => console.warn("Warning: " + w));
if (errors.length) { errors.forEach(e => console.error("Problem: " + e)); console.error(`\n${errors.length} problem(s). Nothing was published.`); process.exit(1); }
console.log(`Content and app checks passed${warnings.length ? ` with ${warnings.length} warning(s)` : ""}.`);
