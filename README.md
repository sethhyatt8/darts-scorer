# Darts Scorer

Static web app for scoring darts games on desktop and iPad with:

- React
- Vite
- TypeScript
- ESLint
- `gh-pages` deployment script
- GitHub Actions Pages deployment workflow

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Start development:

```bash
npm run dev
```

## Deploy to GitHub Pages

This template includes:

- `predeploy`: `npm run build`
- `deploy`: `gh-pages -d dist`

To deploy:

```bash
npm run deploy
```

`vite.config.ts` uses `base: './'` so the built app remains portable for GitHub Pages project hosting.

For automatic deploys, this template also includes `.github/workflows/deploy-pages.yml`, which publishes on pushes to `main`.

## One-time Cursor setup (important)

Repository rules can guide agent behavior, but frequent run-approval prompts are controlled by your Cursor permissions mode.

In Cursor:

1. Open Agent settings and set approval mode to `allowlist` (or a less strict mode you are comfortable with).
2. Expand your allowlist to include normal dev commands (for example: `npm install`, `npm run *`, `npx vite`, `git status`, `git diff`, `git log`).
3. Keep destructive commands requiring approval (for example: `rm -rf`, `git reset --hard`, force pushes).

After this one-time setup, cloned repos using this template should run with far fewer interruptions.

## Project intent

Track x01 and Cricket matches with a board-first tap UI, end-turn/undo flow, and local player stats/history.
