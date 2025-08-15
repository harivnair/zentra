Deployment notes

This repository has a GitHub Actions workflow that builds the Vite app and publishes the `dist/` folder to GitHub Pages on pushes to `main` and `dev`.

How it works
- The workflow runs `npm ci` and `npm run build`.
- The `./dist` folder is published using `peaceiris/actions-gh-pages`.

If you need to change the target branch or add a custom domain, update `.github/workflows/deploy.yml` and your repository Pages settings.
