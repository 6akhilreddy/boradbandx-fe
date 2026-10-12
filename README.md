# BroadbandX Frontend UI

BroadbandX Customer & Billing Management System frontend built with React, Vite, Tailwind CSS, and Zustand.

---

## Deployments & Domains

- **Dev Frontend (CNAME)**: [https://broadbandx.vercel.app](https://broadbandx.vercel.app)
- **Dev Backend API**: [https://broadbandx-be.vercel.app/api](https://broadbandx-be.vercel.app/api)
- **Local Dev Frontend**: `http://localhost:5173`
- **Local Dev Backend**: `http://localhost:3000/api`

---

## API Base URL Configuration

The frontend dynamically resolves the backend API URL in `src/config/urls.js`:

1. **Custom Override**: Set `VITE_API_URL` environment variable if you want to explicitly override the backend endpoint.
2. **Deployed / Vercel (`broadbandx.vercel.app`)**:
   - Automatically routes to `https://broadbandx-be.vercel.app/api` when accessed from any non-localhost domain or in production builds.
3. **Local Development (`localhost` / `127.0.0.1`)**:
   - Defaults to `http://localhost:3000/api`.

---

## Getting Started

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```
