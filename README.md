# Forme 3D Hand Viewer

A polished, framework-free nail-art mockup with a real rigged hand rendered from
a same-origin GLB. It uses a small purpose-built WebGL 2 renderer, so the page
has no runtime packages, CDN imports, or build step.

The renderer reads the model's skinned mesh, 69-joint skeleton, inverse bind
matrices, and `Open/Close` animation. The five original fingernail UV regions are
remapped in the hand shader to a cached five-cell Canvas atlas, so every finger
can carry coordinated independent artwork without separate nail meshes. Card
previews and atlases come from the same framework-free Canvas 2D design system;
the original skin texture remains separate and is never modified by selection.

## Model credit

This work uses [“Rigged hand”](https://sketchfab.com/3d-models/rigged-hand-eae97cc2a742413cb5338ab942b12c1e)
by [Elena FF](https://sketchfab.com/elenaferfor), licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The supplied
GLB is vendored unmodified at `public/assets/models/rigged-hand.glb`; the full
attribution is available beside it in `rigged-hand-license.txt` and in the UI.

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

Edit `public/index.html` for the structure, `public/styles.css` for the design,
and `public/script.js` for the viewer and interactions.

## Contributing

Every change starts from an issue, goes through a feature branch and PR, and is
gated by CI before it can merge. See `.github/` for issue/PR templates and workflows.

`npm install` sets up a pre-commit hook (via husky) that runs
[gitleaks](https://github.com/gitleaks/gitleaks) against staged changes to catch
secrets before they're committed. Install gitleaks locally so the hook can run:

```bash
brew install gitleaks   # macOS/Linuxbrew
# or see https://github.com/gitleaks/gitleaks#installing
```

If gitleaks isn't installed locally the hook just warns and skips — CI runs the
same scan on every PR as the authoritative check either way.
