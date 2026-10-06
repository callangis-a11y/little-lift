# Little Lift

![Little Lift](public/brand/little-lift-lockup.svg)

**A little lift, any time.** A free, private wellbeing app for everyone, supported by the [Mental Awareness Foundation](https://www.mentalawarenessfoundation.org/). It works in any phone browser and can be added to the home screen like an app. It also works offline.

**What's in it:** a Get help now button on every screen, daily mood check-ins, games based on CBT techniques, mood-lifting activities, breathing and grounding tools, a personal safety plan, and guides on helping a mate, exercise, ADHD and grief. It also lists the services the Foundation funds, its events and supporting gyms.

**Privacy:** there are no accounts, tracking or ads. Everything a person types stays on their own phone.

---

## Updating the app

Most updates are content: a new event, a changed phone number, another gym. Content lives in four simple files in the `content` folder. Changes go live about two minutes after they're saved to `main`.

Before anything goes live, automatic checks run. If something's wrong (a typo that breaks the file, a web link without `https://`, or a core crisis line being hidden), the change is stopped and the live app stays as it was.

### Option 1: Ask Claude

In Claude (claude.ai or the Claude app) with GitHub connected, or in Claude Code, say for example:

> In the little-lift repo, add the Walk For Awareness 2026 date: Sunday 9 November, Brisbane. Open a pull request.

Claude reads `AGENTS.md`, makes the change, runs the checks and opens a pull request for you to merge.

### Option 2: Ask ChatGPT

In ChatGPT, open **Codex** and connect it to this GitHub repository. Then ask in plain English, as above. Codex follows `AGENTS.md` and opens a pull request. Review it and press **Merge** on GitHub to publish.

### Option 3: Edit it yourself on GitHub

1. Open the file in `content/` (for example `content/events.json`).
2. Click the pencil icon.
3. Copy an existing item, paste it below, and change the words. Keep the quotes and commas.
4. Click **Commit changes**. It goes live in about two minutes. If you broke the format, the **Actions** tab shows a red cross with a plain-English explanation, and the live app isn't affected.

### Example: adding an event

```json
{
  "id": "walk-2026",
  "title": "Walk For Awareness 2026",
  "date": "2026-11-09",
  "when": "Sunday 9 November, 7am",
  "place": "Brisbane",
  "blurb": "Walk with thousands of Queenslanders to start conversations about mental health.",
  "url": "https://www.walkforawareness.org.au/"
}
```

---

## Going live for the first time (one-off setup)

1. Create a GitHub repository (for example `little-lift`) and upload these files.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main`, or run the **Check and publish** workflow from the **Actions** tab. The site appears at `https://<your-account>.github.io/little-lift/`.
4. Optional: to use your own web address (like `app.mentalawarenessfoundation.org`), add it under **Settings → Pages → Custom domain** and add the DNS record GitHub shows you.

GitHub Pages is free for public repositories. The app has no secrets in it, so a public repository is fine. Cloudflare Pages or Netlify also work: point them at this repository with build command `node scripts/build.mjs` and output folder `dist`.

## For developers

```bash
npm install          # installs the test browser tooling
npm run check        # validate content, build, run the browser smoke test
npm run serve        # build and preview locally
```

- `src/app.html` holds the whole app (markup, styles and script). `scripts/build.mjs` wraps it into `dist/index.html` and adds offline support (`public/sw.js`) and the app manifest.
- The same `src/app.html` also runs as a Claude artifact. There it reads content from the artifact's own database instead of `content/`.
- Rules for AI assistants are in `AGENTS.md`.
- Brand: logo files are in `public/brand/`. The full brand guide (palette, type, voice, logo rules) is kept as a Claude design system called "Little Lift". In short: coral `#FF6A55` is the brand colour, sky blue `#1D6FB8` is for actions, red is only for help. Headings use Gabarito, and body text uses Atkinson Hyperlegible.
