Local deploy script

1. Install the gh-pages package:

   npm install --save-dev gh-pages

2. Build and publish:

   npm run deploy

3. Notes

- This uses the `gh-pages` package which pushes the built `dist` to the `gh-pages` branch.
- If you get a 403 when the package tries to push, either enable Actions write permissions (not applicable locally) or create a Personal Access Token (PAT) with `repo` scope and set it as a remote in the form:

  git remote set-url origin https://<PAT>@github.com/<owner>/<repo>.git

- For client review you can visit:

  https://<owner>.github.io/<repo>/  (for public repos)

- For private repos, configure GitHub Pages in repo settings or use a PAT with appropriate access.
