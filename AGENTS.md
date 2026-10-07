# Instructions for AI assistants (Claude, ChatGPT/Codex and others)

You are helping maintain **Little Lift** ("A little lift, any time."), a free mental health and wellbeing app for everyone, supported by the Mental Awareness Foundation (Brisbane, Australia). People in distress use it. Accuracy and safety come before everything else.

## How publishing works

- Merging into `main` publishes the live site automatically (GitHub Actions → GitHub Pages, about 1–2 minutes).
- Every change is checked first by `scripts/validate.mjs` and `scripts/smoke.mjs`. If a check fails, nothing is published. Fix the problem rather than weakening a check.
- Prefer opening a pull request with a clear title (e.g. "Add Walk For Awareness 2026 date") so a person can review it. Push straight to `main` only when the person you're working with asks you to.

## Where things live

| What | File | Who usually edits |
|---|---|---|
| Phone and text support lines | `content/lines.json` | Content editors |
| Organisations The Mental Awareness Foundation funds | `content/services.json` | Content editors |
| Events (Walk For Awareness, luncheon, workshops) | `content/events.json` | Content editors |
| Gyms that support the Foundation | `content/partners.json` | Content editors |
| The app itself (screens, games, guides, styles) | `src/app.html` | Developers only |
| Icons, offline support, app manifest | `public/` | Developers only |

**For content updates, only edit files in `content/`.** Don't touch `src/app.html` unless you're asked to change how the app works.

## Content file format

Each file looks like `{ "_help": "...", "items": [ ... ] }`. Keep the `_help` line. Every item needs a unique `id` (lowercase letters, numbers, dashes).

**lines.json** (`id`, `name`, `number` required): `sms`, `who` (who it's for), `hours`, `url`, `order` (number, lower shows first), `hidden` (true/false).

**services.json** (`id`, `name` required): `category`, `area`, `blurb` (one sentence), `phone`, `url`, `order`, `hidden`.

**events.json** (`id`, `title` required): `date` (`YYYY-MM-DD` start; past events hide themselves), `end` (`YYYY-MM-DD` last day, for week- or month-long events), `host` (who runs it; events hosted by "The Mental Awareness Foundation" are grouped first), `when` (free text like "Sunday 9 November, 7am"), `place`, `blurb`, `url`, `order`, `hidden`. Include mental health events from any reputable organisation, not only the Foundation's, and check dates on the organiser's own website.

**partners.json** (`id`, `name` required): `area`, `blurb` (address), `phone`, `url`, `offer` (short member offer, e.g. "Free week for walkers"), `order`, `hidden`.

To remove something temporarily, set `"hidden": true` instead of deleting it.

## Safety rules (do not break these)

1. **Never change, add or remove a crisis phone number unless you have checked it on the service's official website** in the same session. Say which page you checked in the pull request.
2. Lifeline (13 11 14), Suicide Call Back Service (1300 659 467), Beyond Blue (1300 22 4636), Kids Helpline (1800 55 1800) and the Call 000 button must always be present. The app has them built in as a safety net, and the validator blocks hiding them.
3. Don't add medical advice, diagnoses, dosages or claims that a tool "treats" or "cures" anything. Describe tools as support, not treatment.
4. Don't add tracking, analytics, ads, sign-ups or anything that sends a user's entries off their phone. User data stays in the browser's local storage only.
5. Don't invent facts about organisations, people, dates or offers. If you don't know, ask, or leave the field out.
6. Plain text only in content files. No HTML, no Markdown.

## Brand

- Name: always "Little Lift" in text (the logo wordmark is lowercase, but text isn't). Tagline: "A little lift, any time."
- Logo files are in `public/brand/`. Don't redraw, recolour or retype the logo.
- Colours are CSS tokens in `src/app.html`: coral is the brand (decorative), sky blue `--accent` is for buttons and links, and `--danger` red is only for help and emergency cues.
- Fonts: Gabarito for headings, Atkinson Hyperlegible for body text. The website serves its own copies from `public/fonts/` (SIL Open Font Licence, see the OFL files there); `scripts/build.mjs` removes the Google Fonts link so the live site makes no requests to Google. The Claude artifact preview still uses Google Fonts.

## Writing style

Australian English (organisation, colour, mum). Warm, plain and direct, like a kind friend who knows their stuff. Short sentences. Talk to the reader as "you". No jargon, no exclamation-mark hype, no guilt ("you should..."). Name things by what people recognise.

## Before you finish

Run `npm run check` (validate → build → browser smoke test). If you can't run it, run at least `node scripts/validate.mjs`. Mention in your summary what you changed and what you checked.

## Changing the app itself (developers)

- `src/app.html` is page content only (no `<!doctype>`, `<html>`, `<head>` or `<body>`). `scripts/build.mjs` wraps it for the website. The same file also runs as a Claude artifact preview, where content comes from that artifact's database instead of `content/`.
- All colours are CSS tokens at the top with light and dark values. Test both themes at 360px wide.
- Keep everything in one file with no build-time frameworks, so any editor can change it.
