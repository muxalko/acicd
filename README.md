# Cloudflare Pages starter

A simple static site with no build step.

## Develop locally

```bash
npm install
npm run dev
```

Wrangler will print the local URL (normally `http://localhost:8788`).

## Deploy

### From the command line

Log in once, then deploy:

```bash
npx wrangler login
npm run deploy
```

Wrangler will ask you to create or choose a Cloudflare Pages project.

### From a Git repository

1. Push this folder to GitHub or GitLab.
2. In the Cloudflare dashboard, open **Workers & Pages** and create a Pages project.
3. Connect the repository.
4. Leave the build command empty and set the output directory to `public`.
5. Deploy.

Edit `public/index.html` for the content and `public/styles.css` for the design.

## Contributing

Every change starts from an issue, goes through a feature branch and PR, and is
gated by CI before it can merge. See `.github/` for issue/PR templates and
workflows, `CLAUDE.md` for how the full pipeline and bot identity work, and
`ROADMAP.md` for known gaps/next steps.

`npm install` sets up a pre-commit hook (via husky) that runs
[gitleaks](https://github.com/gitleaks/gitleaks) against staged changes to catch
secrets before they're committed. Install gitleaks locally so the hook can run:

```bash
brew install gitleaks   # macOS/Linuxbrew
# or see https://github.com/gitleaks/gitleaks#installing
```

If gitleaks isn't installed locally the hook just warns and skips — CI runs the
same scan on every PR as the authoritative check either way.
