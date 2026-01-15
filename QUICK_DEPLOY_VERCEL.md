# Quick Vercel Deployment (5 Minutes)

## 🚀 Quick Start

### 1. Create Vercel Project
- Go to [vercel.com](https://vercel.com)
- Click **"Add New..."** → **"Project"**
- Import `riser_frontend` from GitHub

### 2. Set Environment Variable (Optional)
The frontend is already configured to use `https://web-production-d4f82.up.railway.app` by default.

If you need to override it, go to **"Settings"** → **"Environment Variables"** and add:

```bash
VITE_API_URL=https://web-production-d4f82.up.railway.app
```

### 3. Deploy
- Click **"Deploy"**
- Wait for build to complete

### 4. Update Backend CORS
In Railway, update `ALLOWED_ORIGINS`:
```bash
ALLOWED_ORIGINS=https://your-project.vercel.app
```

### 5. Test
Visit: `https://your-project.vercel.app`

## ✅ Done!

For detailed instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

