# Roadmap

Proposed improvements to the CI/CD pipeline, not yet implemented. Pick items
up as issues when there's time — this file exists so they aren't lost between
sessions. Move an item to "Done" (or delete it) once it ships, and note the
PR/issue number.

## Pipeline & workflow

- **PR preview deployments** — reviewers currently can't see a change live
  before approving. Deploy each PR branch to a throwaway Cloudflare Pages
  preview in CI and comment the URL on the PR.
- **Smoke test before promotion** — `deploy-production` runs as soon as it's
  approved, with nothing verifying staging is actually healthy first. Add a
  basic check (e.g. curl the staging URL, assert 200 + expected content) as
  part of `deploy-staging` or as a gate before `deploy-production`.
- **Concurrency control on deploy.yml** — no `concurrency:` group is set, so
  two quick merges to `main` could race and deploy out of order.
- **Documented rollback process** — no runbook or script exists for rolling
  production back to a previous deployment if a bad release ships. Cloudflare
  Pages retains deployment history; write a short doc or `wrangler pages
  deployment` rollback script.

## Security

- **Per-environment scoped Cloudflare API tokens** — `staging` and
  `production` currently share one account-wide `CLOUDFLARE_API_TOKEN`
  repo secret. Split into two tokens, each scoped to only its own Pages
  project, stored as environment secrets instead of repo secrets, to shrink
  blast radius if one leaks.
- **Dependabot** — no automated dependency/security updates configured for
  `wrangler`/`husky`. Add `.github/dependabot.yml`.
- **`enforce_admins: false` on branch protection** — the repo owner can
  bypass required reviews/checks. Intentional safety valve for now; revisit
  if this becomes a multi-maintainer repo.

## Housekeeping

- **Custom domain** — production still serves from the default
  `acicd-production.pages.dev`, not a real domain.
- **Bot key continuity** — the GitHub App private key
  (see `AGENTS.md` → Bot identity) only exists on one machine. If it's lost,
  generate a new key from the App's settings page and update `AGENTS.md`.
  No backup/rotation process exists yet.
