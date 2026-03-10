# Playbook: Rebuild an Old Site → Deploy on Hetzner

*Written after rebuilding www.schiffer.se and seatower.schiffer.se in March 2026.*
*Use this as a checklist + lessons-learned guide next time you do something similar.*

---

## Overview of the stack

```
GitHub repo
  └─ push to main
       └─ GitHub Actions (CI/CD)
            └─ npm build + rsync
                 └─ Hetzner VPS (89.167.90.112)
                      └─ Docker: nginx:alpine container
                           └─ Nginx Proxy Manager (routes + SSL)
                                └─ Cloudflare DNS (proxy)
                                     └─ Browser
```

The server runs a master `docker-compose.yml` at `/home/deploy/hosting/` that holds
**all** sites. Each site is one nginx container serving a `dist/` folder. Nginx Proxy
Manager (also in Docker) handles routing by hostname and terminates SSL with Let's Encrypt.

---

## Step A — Create the GitHub repo and add secrets (5 min)

1. Create a new **private** repo on GitHub (e.g. `client-schiffer`).
2. Go to **Settings → Secrets and variables → Actions → New repository secret** and add:
   - `HETZNER_HOST` = `89.167.90.112`
   - `HETZNER_USER` = `deploy`
   - `HETZNER_SSH_KEY` = contents of `~/.ssh/id_ed25519` (the private key)
3. Add `.github/workflows/deploy.yml` (see template below).

### deploy.yml template (Type A — static Vite build)

```yaml
name: Deploy to Hetzner

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy via rsync
        uses: burnett01/rsync-deployments@7.0.1
        with:
          switches: -avzr --delete
          path: ./dist/
          remote_path: ~/hosting/sites/CLIENT_NAME/dist/
          remote_host: ${{ secrets.HETZNER_HOST }}
          remote_user: ${{ secrets.HETZNER_USER }}
          remote_key: ${{ secrets.HETZNER_SSH_KEY }}
```

Replace `CLIENT_NAME` with the folder name (e.g. `client-schiffer`).

---

## Step B — Server setup (10 min)

SSH as the deploy user (NOT root):

```bash
ssh -i ~/.ssh/id_ed25519 deploy@89.167.90.112
```

### 1. Create the dist directory

```bash
mkdir -p ~/hosting/sites/CLIENT_NAME/dist
```

This must exist **before** GitHub Actions runs its first rsync, otherwise the job fails.

### 2. Add the service to docker-compose.yml

```bash
nano ~/hosting/docker-compose.yml
```

Append under `services:`:

```yaml
  CLIENT_NAME:
    image: nginx:alpine
    container_name: CLIENT_NAME
    restart: unless-stopped
    volumes:
      - ./sites/CLIENT_NAME/dist:/usr/share/nginx/html:ro
    networks:
      - web
```

### 3. Start the new container

```bash
cd ~/hosting && docker compose up -d CLIENT_NAME
```

Verify it's running:

```bash
docker ps | grep CLIENT_NAME
```

---

## Step C — Push the code (2 min)

```bash
git init
git add .
git commit -m "Initial build"
git remote add origin git@github.com:YOURUSERNAME/CLIENT_NAME.git
git push -u origin main
```

Watch the Actions tab on GitHub — the first run should go green within ~1 minute.

**If it fails with "No such file or directory":** Step B wasn't done yet. Create the
directories on the server and re-trigger with an empty commit:

```bash
git commit --allow-empty -m "Trigger deployment"
git push
```

---

## Step D — Cloudflare DNS (2 min)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → agiletransition.se → DNS → Records
2. Click **Add record**:
   - Type: `A`
   - Name: `subdomain` (e.g. `schiffer`)
   - IPv4: `89.167.90.112`
   - Proxy status: **Proxied** (orange cloud)
   - TTL: Auto
3. Save.

DNS propagates globally within minutes via Cloudflare.

---

## Step E — Nginx Proxy Manager (5 min)

Go to http://89.167.90.112:81 and log in.

1. Click **Add Proxy Host**
2. **Details tab:**
   - Domain Names: `subdomain.agiletransition.se`
   - Scheme: `http`
   - Forward Hostname/IP: `CLIENT_NAME` (the Docker container name)
   - Forward Port: `80`
   - Block Common Exploits: ON
3. **SSL tab:**
   - SSL Certificate: **Request a new Certificate** (with Let's Encrypt)
   - Force SSL: ON
   - HTTP/2 Support: ON
4. Click **Save** — NPM requests the cert and the host goes Online in ~10 seconds.

---

## Step F — Verify (2 min)

```bash
# From your Mac terminal:
curl -s -o /dev/null -w "%{http_code}" https://subdomain.agiletransition.se
# Should return: 200
```

Or just open the URL in a browser. Note: your local DNS may take a few extra minutes
to propagate even after Cloudflare has it — use `dig @1.1.1.1 subdomain.agiletransition.se`
to confirm global resolution before blaming the setup.

---

## Building the sites — what worked well

### Vite + React + Tailwind + TypeScript

- Standard `npm create vite@latest` scaffold, add Tailwind manually.
- Fast build times (~3s), tiny output bundles.
- TypeScript catches errors before they reach the server.

### HashRouter (react-router-dom)

Using `<HashRouter>` instead of `<BrowserRouter>` means all routes are served from
`index.html` via the URL hash (`/#/om-oss`). The nginx container needs **zero extra
configuration** — it just serves files statically. BrowserRouter would require nginx
`try_files $uri /index.html` which the default nginx:alpine image doesn't have.

### Photos directly in git

The 201 Havstornet photos are ~16 MB total (already compressed by iWeb). Committing them
directly to the repo (under `public/assets/gallery/`) means they get rsynced alongside
the JS/CSS bundle in one step — no separate upload process needed.

---

## Lessons learned / gotchas

### 1. Create .gitignore BEFORE the first git add

If you forget, `node_modules/` (100k+ files) gets committed. Fix:

```bash
# Create .gitignore with: node_modules/, dist/, .DS_Store
rm -rf .git
git init
git add .
git commit -m "Initial build (clean)"
git push --force
```

Don't use `git checkout --orphan` — it copies the existing index including node_modules.

### 2. Server directories must exist before GitHub Actions runs

The rsync target `~/hosting/sites/CLIENT_NAME/dist/` must be created manually on the
server **before** the first push. GitHub Actions cannot create it. Symptom: action fails
with `rsync: mkdir ... failed: No such file or directory`.

### 3. SSH: deploy user, not root

The `deploy` user is the right account for everything deployment-related:
- Owns `~/hosting/` entirely
- Is in the `docker` group
- Can run `docker compose` commands

Root SSH may be broken if the key in `~/.ssh/authorized_keys` doesn't match. The
deploy key at `~/.ssh/id_ed25519` is what works. Don't fight root access — use deploy.

### 4. workflow_dispatch requires a trigger in the YAML

`gh workflow run` only works if the workflow has `workflow_dispatch:` in its `on:` block.
To re-trigger a push-only workflow without making a real change:

```bash
git commit --allow-empty -m "Trigger deployment"
git push
```

### 5. Filenames with spaces in URLs

If any asset filename contains a space (e.g. `HAVSTORNET 2013.jpg`), wrap the `src`
attribute value with `encodeURIComponent()`:

```tsx
<img src={`/assets/gallery/${encodeURIComponent(filename)}`} />
```

### 6. DNS propagation is not instant locally

Even after adding a Cloudflare DNS record, your local resolver (ISP DNS) may take
5–15 minutes to pick it up. Cloudflare's global edge resolves instantly. Confirm with:

```bash
dig @1.1.1.1 subdomain.agiletransition.se +short   # Cloudflare DNS — fast
dig subdomain.agiletransition.se +short              # Your local DNS — may be slow
```

A `curl` via the Cloudflare edge IP (`--resolve`) lets you test before local DNS catches up:

```bash
curl -s -o /dev/null -w "%{http_code}" \
  --resolve subdomain.agiletransition.se:443:104.21.26.90 \
  https://subdomain.agiletransition.se
```

### 7. NPM "Online" ≠ files are there yet

Nginx Proxy Manager marks a host as Online as soon as it can connect to the container.
The container starts serving immediately even if `dist/` is empty (nginx returns 403).
The actual site files arrive on the first successful GitHub Actions run.

---

## Future: switching to the real domains

When ready to go live on `www.schiffer.se` and `seatower.schiffer.se`:

1. **In the registrar / DNS for schiffer.se:** point `www` and `seatower` A records
   to `89.167.90.112` (or add them to Cloudflare if you move schiffer.se there).
2. **In Nginx Proxy Manager:** edit each proxy host and add the real domain as an
   additional Domain Name, then re-request the SSL certificate to include it.
3. Test, then optionally redirect the old domain to the new one.

No code changes needed in the React apps — they use HashRouter and relative asset paths.

---

## Server quick-reference

```bash
# SSH in
ssh -i ~/.ssh/id_ed25519 deploy@89.167.90.112

# Check running containers
docker ps

# Restart a container
docker compose -f ~/hosting/docker-compose.yml restart CLIENT_NAME

# View nginx logs for a container
docker logs CLIENT_NAME --tail 50

# Check deployed files
ls ~/hosting/sites/CLIENT_NAME/dist/

# Edit docker-compose
nano ~/hosting/docker-compose.yml
```

Nginx Proxy Manager UI: http://89.167.90.112:81
