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
