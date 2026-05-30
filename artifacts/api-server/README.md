# API Server — Local Start (Windows)

Quick commands to build and run the API server locally on Windows (cmd.exe):

1. Ensure you have a `.env` in the repo root with `DATABASE_URL` set (do NOT commit it).

2. Build the server:

```powershell
pushd "c:\Users\administrator1\OneDrive - FIITJEE LTD\Desktop\blogging-website-\artifacts\api-server"
pnpm run build
popd
```

3. Start the server (from repo root) and set `PORT`:

```cmd
pushd "c:\Users\administrator1\OneDrive - FIITJEE LTD\Desktop\blogging-website-"
set PORT=3000
node --enable-source-maps ./artifacts/api-server/dist/index.mjs
popd
```

Alternative (single-line):

```cmd
set PORT=3000 && node --enable-source-maps ./artifacts/api-server/dist/index.mjs
```

Notes:

- `dotenv` is loaded in the server bootstrap, so environment variables from the repository `.env` will be read when starting from the repository root.
- Don't expose `DATABASE_URL` or other secrets; store them in your hosting provider's environment variables for production.
- Health endpoint: `GET /api/healthz` (e.g. `http://localhost:3000/api/healthz`).
