# Familjerna Schiffer — www.schiffer.se

Static family website rebuilt as a modern React/Tailwind app in March 2026.
**Preview URL:** https://schiffer.agiletransition.se
**Live URL (future):** https://www.schiffer.se

---

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS v3 |
| Routing | react-router-dom v6 (HashRouter) |
| Hosting | Hetzner VPS — nginx:alpine Docker container |
| CI/CD | GitHub Actions → rsync to server |
| Proxy / SSL | Nginx Proxy Manager + Let's Encrypt |
| DNS | Cloudflare (proxied) |

HashRouter is used so the nginx container needs no special `try_files` configuration.

---

## Pages

| Route | File | Content |
|-------|------|---------|
| `/#/` | `src/pages/Home.tsx` | Hero, intro, three info columns |
| `/#/om-oss` | `src/pages/OmOss.tsx` | Family member cards (Åse, Lasse, Susanne, Elin) |
| `/#/film` | `src/pages/Film.tsx` | Three embedded YouTube videos |
| `/#/lankar` | `src/pages/Lankar.tsx` | Links to Havstornet, Diabetesförbundet, Pima |

---

## Local development

```bash
cd client-schiffer
npm install
npm run dev       # → http://localhost:5173
```

Build for production:

```bash
npm run build     # output in ./dist/
```

---

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml` which:

1. Runs `npm ci && npm run build`
2. Rsyncs `./dist/` → `deploy@89.167.90.112:~/hosting/sites/client-schiffer/dist/`

The server's nginx container mounts `~/hosting/sites/client-schiffer/dist` and serves it on port 80. Nginx Proxy Manager routes `schiffer.agiletransition.se` → the container with Force SSL + Let's Encrypt.

### Required GitHub secrets

| Secret | Value |
|--------|-------|
| `HETZNER_HOST` | `89.167.90.112` |
| `HETZNER_USER` | `deploy` |
| `HETZNER_SSH_KEY` | Private key matching deploy user's `~/.ssh/authorized_keys` |

---

## Server location

```
/home/deploy/hosting/
  docker-compose.yml        ← schiffer service defined here
  sites/
    client-schiffer/
      dist/                 ← deployed files land here
```

Docker service in `docker-compose.yml`:

```yaml
schiffer:
  image: nginx:alpine
  container_name: schiffer
  restart: unless-stopped
  volumes:
    - ./sites/client-schiffer/dist:/usr/share/nginx/html:ro
  networks:
    - web
```

---

## Origin

Rebuilt from the original iWeb-generated site (`www.schiffer.se`, circa 2012) stored in
`/Users/thomasschiffer/Downloads/www/FAMILJEN_SCHIFFER_FAMILY/`.
Content was modernised; photos were not included (family site, no photos needed).
