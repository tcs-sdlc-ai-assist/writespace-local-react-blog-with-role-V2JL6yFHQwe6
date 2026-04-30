# Deployment Guide

This document covers everything you need to deploy **WriteSpace** to production. The application is a static single-page application (SPA) built with Vite and React 18. All data is persisted in the browser's localStorage — there is no backend server, database, or external API required.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build for Production](#build-for-production)
- [Vercel Deployment](#vercel-deployment)
  - [Automatic Deployment via Git](#automatic-deployment-via-git)
  - [Manual Deployment via Vercel CLI](#manual-deployment-via-vercel-cli)
  - [Vercel Project Settings](#vercel-project-settings)
- [SPA Routing Configuration](#spa-routing-configuration)
- [Environment Variables](#environment-variables)
- [Alternative Hosting Platforms](#alternative-hosting-platforms)
  - [Netlify](#netlify)
  - [GitHub Pages](#github-pages)
  - [Static File Server](#static-file-server)
- [CI/CD Notes](#cicd-notes)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (included with Node.js)
- A [Vercel](https://vercel.com/) account (for Vercel deployment)
- A Git repository hosted on GitHub, GitLab, or Bitbucket

---

## Build for Production

Generate an optimized production build in the `dist/` directory:

```bash
npm install
npm run build
```

The output is a set of static files (HTML, CSS, JS, and assets) in `dist/` that can be served by any static file host.

To preview the production build locally before deploying:

```bash
npm run preview
```

To run the test suite before deploying:

```bash
npm test
```

---

## Vercel Deployment

Vercel is the recommended hosting platform for WriteSpace. It provides zero-configuration builds for Vite projects, automatic HTTPS, global CDN, and instant rollbacks.

### Automatic Deployment via Git

This is the recommended approach. Vercel will automatically build and deploy on every push to your default branch.

1. **Push your repository** to GitHub, GitLab, or Bitbucket.

2. **Import the project** in the [Vercel Dashboard](https://vercel.com/new):
   - Click **"Add New…"** → **"Project"**.
   - Select your Git provider and authorize access if prompted.
   - Choose the repository containing the WriteSpace project.

3. **Confirm build settings**. Vercel auto-detects Vite and pre-fills the correct values:

   | Setting           | Value         |
   | ----------------- | ------------- |
   | Framework Preset  | Vite          |
   | Build Command     | `npm run build` |
   | Output Directory  | `dist`        |
   | Install Command   | `npm install` |
   | Node.js Version   | 18.x          |

4. **Click Deploy**. Vercel will install dependencies, run the build, and publish the site.

5. **Subsequent deploys** happen automatically whenever you push commits to the connected branch. Pull request branches get unique preview URLs.

### Manual Deployment via Vercel CLI

If you prefer deploying from your local machine:

1. Install the Vercel CLI globally:

   ```bash
   npm install -g vercel
   ```

2. Authenticate with your Vercel account:

   ```bash
   vercel login
   ```

3. Deploy from the project root:

   ```bash
   vercel
   ```

   For a production deployment (bypassing the preview stage):

   ```bash
   vercel --prod
   ```

The CLI will prompt you to link the project on first run. Accept the defaults or customize as needed.

### Vercel Project Settings

If you need to adjust settings after the initial import, go to your project in the Vercel Dashboard → **Settings** → **General**:

- **Build & Development Settings**:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`
- **Node.js Version**: 18.x (or later)
- **Root Directory**: `.` (leave as default unless the project is in a monorepo subdirectory)

---

## SPA Routing Configuration

WriteSpace uses React Router v6 with client-side routing. All routes (e.g., `/blogs`, `/admin`, `/blog/:id`) are handled in the browser by JavaScript — there are no corresponding files on the server for these paths.

To ensure that deep links and page refreshes work correctly, the server must rewrite all requests to `index.html`. This is configured in the `vercel.json` file at the project root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This catch-all rewrite rule tells Vercel to serve `index.html` for every URL path, allowing React Router to handle routing on the client side.

> **Important:** Do not remove or modify `vercel.json`. Without this file, navigating directly to any route other than `/` will return a 404 error in production.

---

## Environment Variables

**No environment variables are required to build or run WriteSpace.**

The application is entirely client-side with all data stored in the browser's localStorage. There is no backend API, no database connection string, and no secret keys.

If you need to add environment variables in the future (for example, to integrate an analytics service), follow these rules:

- Prefix all client-side variables with `VITE_` so Vite exposes them to the browser bundle.
- Access them in code via `import.meta.env.VITE_VARIABLE_NAME`.
- **Never** use `process.env` — it is not available in Vite client builds.
- Add variables in the Vercel Dashboard under **Settings** → **Environment Variables**, or in a local `.env` file (which is git-ignored).

Example `.env` file:

```
VITE_APP_TITLE=WriteSpace
VITE_ANALYTICS_ID=UA-XXXXXXXXX
```

Example usage in code:

```js
const title = import.meta.env.VITE_APP_TITLE || 'WriteSpace';
```

See `.env.example` in the project root for reference.

---

## Alternative Hosting Platforms

While Vercel is recommended, WriteSpace can be deployed to any static hosting provider. The key requirement is SPA rewrite support so that all routes serve `index.html`.

### Netlify

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the project in the [Netlify Dashboard](https://app.netlify.com/).
3. Set the build settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Create a `netlify.toml` file in the project root (or use the `_redirects` approach):

   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

   Alternatively, create a `public/_redirects` file:

   ```
   /*    /index.html   200
   ```

5. Deploy.

### GitHub Pages

1. Install the `gh-pages` package:

   ```bash
   npm install --save-dev gh-pages
   ```

2. Add a deploy script to `package.json`:

   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. Create a `dist/404.html` that is a copy of `dist/index.html` (GitHub Pages serves `404.html` for unknown routes, which enables SPA routing).

4. Run `npm run deploy`.

> **Note:** GitHub Pages does not natively support SPA rewrites. The `404.html` workaround works but may cause a brief 404 status code before the client-side router takes over.

### Static File Server

For self-hosted environments, serve the `dist/` directory with any static file server that supports SPA fallback:

**Using `serve` (Node.js):**

```bash
npx serve dist --single
```

**Using Nginx:**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Using Apache (`.htaccess` in `dist/`):**

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## CI/CD Notes

### Automatic Deploys with Vercel + Git

Once your repository is connected to Vercel, the following CI/CD workflow is automatic:

| Event                        | Vercel Behavior                                      |
| ---------------------------- | ---------------------------------------------------- |
| Push to default branch       | Production deployment to your primary domain         |
| Push to any other branch     | Preview deployment with a unique URL                 |
| Pull request opened/updated  | Preview deployment linked to the PR                  |
| Pull request merged          | Production deployment triggered by the merge commit  |

No additional CI/CD configuration files are needed. Vercel handles install, build, and deploy.

### Running Tests in CI

Vercel does not run tests as part of its build pipeline by default. To ensure tests pass before deploying, you have two options:

**Option A: Override the build command in Vercel**

Set the build command in Vercel project settings to:

```bash
npm test -- --run && npm run build
```

The `--run` flag tells Vitest to execute once and exit (non-watch mode). If any test fails, the build command exits with a non-zero code and the deployment is cancelled.

**Option B: Use a separate CI pipeline (recommended)**

Set up a GitHub Actions workflow (or equivalent) that runs tests on every push and pull request. This keeps test execution separate from the build/deploy step.

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm test -- --run
```

### Branch Protection

For production safety, enable branch protection rules on your default branch:

1. Go to your repository settings → **Branches** → **Branch protection rules**.
2. Enable **Require status checks to pass before merging**.
3. Select the CI workflow as a required check.

This ensures that no code is merged (and therefore deployed) unless all tests pass.

---

## Troubleshooting

### Routes return 404 in production

Ensure `vercel.json` exists in the project root with the SPA rewrite rule. If deploying to a platform other than Vercel, configure the equivalent rewrite/fallback rule for that platform (see [Alternative Hosting Platforms](#alternative-hosting-platforms)).

### Build fails with missing dependencies

Run `npm install` before `npm run build`. Verify that all dependencies are listed in `package.json`. The project does not require any system-level dependencies beyond Node.js.

### Blank page after deployment

- Open the browser developer console and check for errors.
- Verify that the **Output Directory** is set to `dist` (not `build` or `public`).
- Ensure the `index.html` file references the correct script path (`/src/main.jsx` is for development only — the production build bundles everything into `dist/`).

### localStorage data not persisting

localStorage is scoped to the origin (protocol + domain + port). Data created on `localhost:3000` will not be available on your production domain. This is expected behavior — each deployment domain has its own isolated localStorage.

### Environment variables not available in the app

- Ensure variables are prefixed with `VITE_`.
- Access them via `import.meta.env.VITE_*`, not `process.env`.
- After adding or changing environment variables in Vercel, trigger a new deployment for the changes to take effect.