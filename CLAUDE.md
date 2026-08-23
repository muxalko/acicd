# Working on this repo

This is a Cloudflare Pages static site (`public/`, no build step) with a full
CI/CD pipeline. This file exists so that any agent or human picking this repo
up cold — including a future session with no memory of building this — can
understand how it works and keep operating it correctly. If you're an agent:
read this before touching workflows, branch protection, or deployment.

## The workflow

Every change follows this path:

1. **Issue** — describes the problem/proposal and acceptance criteria (see
   `.github/ISSUE_TEMPLATE/`). Blank issues are disabled; use a template.
2. **Feature branch** off `main`.
3. **Commit + push + PR**, with `Closes #<issue>` in the PR body so merging
   auto-closes the issue. Use `.github/pull_request_template.md`.
4. **CI** (`.github/workflows/ci.yml`) runs two required checks on every PR
   into `main`: `validate` (basic file/JSON/TOML sanity) and `gitleaks`
   (secret scanning over the PR's commit range).
5. **Human review** — `main` requires 1 approving review before merge (see
   Branch protection below). This only works because PRs are authored by a
   bot identity distinct from the human reviewer — see Bot identity below.
6. **Merge** into `main` closes the linked issue and triggers
   `.github/workflows/deploy.yml`.
7. **Staging deploy** (`deploy-staging` job) runs automatically, no gate —
   deploys to the `staging` GitHub Environment / Cloudflare Pages project.
8. **Manual promotion** — `deploy-production` (`needs: deploy-staging`) is
   gated by the `production` GitHub Environment's required-reviewer rule.
   GitHub pauses the job until a human clicks Approve in the Actions tab —
   that's the manual promotion step, not a second merge or branch.

## Bot identity

Claude (or any agent) operating this repo acts as a **GitHub App**, not a
personal account. This is what makes step 5 above actually work: GitHub
refuses to let a PR author approve their own PR, so if the same personal
account both opened and reviewed PRs, "require approval" would be a no-op.
With a separate bot identity, the human's approval is a real gate.

- **App name / bot login**: `muxalko-acicd-agent[bot]`
- **App ID**: `4688616`
- **Bot user ID**: `320077675` (used in the commit-attribution noreply email)
- **Installed on**: `muxalko/acicd` only
- **Permissions**: Contents (R/W), Issues (R/W), Pull requests (R/W), Metadata (R)
- **Private key location**: `~/workspace/.config/acicd/muxalko-acicd-agent.2026-08-22.private-key.pem`
  on the machine where this was set up. It is **not** in this repo, not in any
  secret store, and was never pasted into a chat transcript — it only ever
  touches disk on that machine. If that machine/file is gone, generate a new
  key from the App's settings page (github.com/settings/apps/muxalko-acicd-agent
  → Generate a private key) and update this doc with the new path.

### Minting a token and acting as the bot

`scripts/gh-app-token.mjs` signs a short-lived JWT with the private key,
exchanges it for a ~1 hour installation access token scoped only to
`muxalko/acicd`, and prints the token to stdout. Nothing persists to disk.

```bash
export GH_TOKEN=$(node scripts/gh-app-token.mjs \
  --app-id 4688616 \
  --key ~/workspace/.config/acicd/muxalko-acicd-agent.2026-08-22.private-key.pem)

gh issue create ...   # now acts as the bot
gh pr create ...      # now acts as the bot
```

For `git push`, don't store the token in the remote URL persistently — pass
it inline for that one push:

```bash
TOKEN=$(node scripts/gh-app-token.mjs --app-id 4688616 --key <path-above>)
git push "https://x-access-token:${TOKEN}@github.com/muxalko/acicd.git" <branch>:<branch>
```

This repo's local git config (`.git/config`, not global) is already set so
commits are attributed to the bot:

```
user.name  = muxalko-acicd-agent[bot]
user.email = 320077675+muxalko-acicd-agent[bot]@users.noreply.github.com
```

If you're a fresh agent session on a different machine, you'll need to set
these two `git config` values yourself before committing.

## Branch protection (`main`)

Applied via `gh api repos/muxalko/acicd/branches/main/protection`:

- Required status checks: `validate`, `gitleaks` (strict — branch must be up to date)
- Required approving reviews: 1
- No force pushes, no deletions
- `enforce_admins: false` — the repo owner can still bypass review/checks in
  an emergency. This is a deliberate safety valve, not an oversight.

## GitHub Environments

- **`staging`**: no protection rules. `vars.CF_PROJECT_NAME = acicd-staging`.
- **`production`**: required reviewer = `muxalko`. `vars.CF_PROJECT_NAME = acicd-production`.

Both environments restrict deploys to protected branches (`main` only).

## Cloudflare

- Account ID: `cc9dce1565798719c1da5a532a3fea59`
- Two separate Pages projects for isolation:
  - `acicd-staging` → https://acicd-staging.pages.dev
  - `acicd-production` → https://acicd-production.pages.dev
- `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` are repo-level GitHub
  Action secrets (`gh secret list --repo muxalko/acicd`), used by both deploy
  jobs. See `ROADMAP.md` for splitting these per-environment.

## Secret scanning

Defense in depth, both using the OSS `gitleaks` project directly (not the
marketplace Action, to avoid any licensing ambiguity):

- **Local**: `.husky/pre-commit` runs `gitleaks protect --staged` on commit.
  If gitleaks isn't installed locally it warns and skips — it's a fast local
  check, not the authoritative one.
- **CI**: the `gitleaks` job in `ci.yml` runs the `zricethezav/gitleaks`
  Docker image against the PR's commit range and is a required status check.
  This is the check that can't be bypassed with `--no-verify`.

## Key files

| Path | Purpose |
|---|---|
| `.github/workflows/ci.yml` | `validate` + `gitleaks` checks, runs on every PR |
| `.github/workflows/deploy.yml` | staging auto-deploy + production manual-approval deploy, runs on push to `main` |
| `.github/ISSUE_TEMPLATE/` | structured issue forms (bug report, feature request) |
| `.github/pull_request_template.md` | PR checklist + `Closes #` convention |
| `.husky/pre-commit` | local gitleaks hook |
| `scripts/gh-app-token.mjs` | mints bot installation tokens from the App's private key |
| `ROADMAP.md` | proposed-but-not-yet-implemented improvements |

## Roadmap

See `ROADMAP.md` for known gaps and proposed next steps — check it before
assuming something hasn't been thought about yet.
