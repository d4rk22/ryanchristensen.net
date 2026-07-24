# ryanchristensen.net

Ryan Christensen's personal site and field notes, built as a static Astro site.

## Stack

- [Astro 7](https://astro.build/) with an [AstroPaper 6.1.0](https://github.com/satnaing/astro-paper/releases/tag/v6.1.0) foundation
- Markdown and MDX content collections
- [Pagefind](https://pagefind.app/) static search
- GitHub Actions and GitHub Pages

## Local development

Node.js 24 is the project and CI runtime.

```bash
nvm use
npm ci
npm run dev
```

The local development server is available at `http://localhost:4321`.

Run the full quality and production checks before publishing:

```bash
npm run check
npm run build
```

The production build type-checks the Astro project, renders the site, and
creates the Pagefind index in `dist/pagefind/`.

## Writing

- Add Markdown or MDX posts under `src/content/posts/`.
- Add or edit standalone pages under `src/content/pages/`.
- Use `draft: true` in post frontmatter to keep a post out of production.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`. The workflow builds
the site with Node.js 24 and deploys `dist/` to GitHub Pages.

The GitHub Pages custom domain is `ryanchristensen.net`. Production DNS points
to GitHub Pages and HTTPS enforcement is enabled. The approval boundary,
record set, validation evidence, and separately gated rollback are documented
in [`docs/dns-cutover.md`](docs/dns-cutover.md).

## Credits and license

This site is based on [AstroPaper](https://github.com/satnaing/astro-paper) by
Sat Naing. The source remains available under the [MIT License](LICENSE).
