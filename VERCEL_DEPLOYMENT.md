# Vercel Deployment Guide for RISER Frontend

This guide will walk you through deploying the RISER frontend to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A GitHub account with the frontend repository
3. Your backend API URL (from Railway or your backend deployment)

## Step 1: Prepare Your Repository

The following files have been added to your frontend:
- `vercel.json` - Vercel configuration file
- `.env.example` - Environment variables template

## Step 2: Create a New Project on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your `riser_frontend` repository from GitHub
4. Vercel will automatically detect it's a Vite project

## Step 3: Configure Build Settings

Vercel should auto-detect your project, but verify these settings:

1. **Framework Preset**: Vite (auto-detected)
2. **Root Directory**: `./` (leave as default)
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `dist` (auto-detected)
5. **Install Command**: `npm install` (auto-detected)

## Step 4: Configure Environment Variables

1. In your Vercel project, go to **"Settings"** → **"Environment Variables"**
2. Add the following environment variable:

### Optional Variable (Default is already set):

```bash
VITE_API_URL=https://web-production-d4f82.up.railway.app
```

**Note**: The frontend is already configured to use `https://web-production-d4f82.up.railway.app` as the default API URL. You only need to set `VITE_API_URL` if you want to override it (e.g., for a different environment or local development).

### How to Get Your Backend URL:

1. Go to your Railway project
2. Find your backend service
3. Copy the URL (e.g., `https://riser-backend.up.railway.app`)

## Step 5: Deploy

1. Click **"Deploy"** button
2. Vercel will:
   - Install dependencies
   - Build your project
   - Deploy to a production URL

## Step 6: Get Your Frontend URL

After deployment, Vercel will provide:
- **Production URL**: `https://your-project.vercel.app`
- **Preview URLs**: For each branch/PR

## Step 7: Update Backend CORS

Update your backend's `ALLOWED_ORIGINS` environment variable to include your Vercel URL:

1. Go to Railway → Your backend service → **"Variables"**
2. Update `ALLOWED_ORIGINS`:
   ```bash
   ALLOWED_ORIGINS=https://your-project.vercel.app,https://your-custom-domain.com
   ```
3. Redeploy your backend (or it will auto-redeploy)

## Step 8: Test Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test the application:
   - Sign up/Login
   - Navigate through pages
   - Make API calls to your backend

## Step 9: Custom Domain (Optional)

1. Go to **"Settings"** → **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Vercel will automatically configure SSL

## Environment Variables Reference

### Development (Local)
Create a `.env` file in the frontend root:
```bash
VITE_API_URL=http://localhost:8000
```

### Production (Vercel)
Set in Vercel dashboard:
```bash
VITE_API_URL=https://your-backend-url.railway.app
```

## Troubleshooting

### Build Fails

- **Check Node.js version**: Vercel uses Node.js 18.x by default
- **Check build logs**: Go to **"Deployments"** → Click on failed deployment → **"Build Logs"**
- **Verify dependencies**: Ensure `package.json` has all required dependencies

### API Calls Fail (CORS Errors)

- Verify `VITE_API_URL` is set correctly in Vercel
- Check backend `ALLOWED_ORIGINS` includes your Vercel URL
- Ensure backend is running and accessible

### 404 Errors on Routes

- Vercel's `vercel.json` includes a rewrite rule to serve `index.html` for all routes
- This enables client-side routing (React Router)
- If you still get 404s, check the rewrite rule in `vercel.json`

### Environment Variables Not Working

- **Important**: Vercel requires environment variables to be prefixed with `VITE_` for Vite projects
- After adding variables, redeploy the project
- Variables are only available at build time, not runtime

### Assets Not Loading

- Check that public assets are in the `public/` directory
- Verify file paths are correct (use relative paths)
- Check browser console for 404 errors

## Continuous Deployment

Vercel automatically deploys when you push to:
- **Production**: `main` or `master` branch
- **Preview**: Any other branch or pull request

### Disable Auto-Deploy

1. Go to **"Settings"** → **"Git"**
2. Toggle **"Automatic deployments"** off

## Preview Deployments

Every push to a branch creates a preview deployment:
- Preview URL: `https://your-project-git-branch-name.vercel.app`
- Perfect for testing before merging to main

## Performance Optimization

Vercel automatically:
- ✅ Optimizes images
- ✅ Minifies JavaScript and CSS
- ✅ Enables CDN caching
- ✅ Provides edge network

## Monitoring

- **Analytics**: Go to **"Analytics"** tab for performance metrics
- **Logs**: View real-time logs in **"Deployments"** → **"Functions"** tab
- **Speed Insights**: Enable in **"Settings"** → **"Speed Insights"**

## Quick Checklist

- [ ] Repository pushed to GitHub
- [ ] Vercel project created
- [ ] `VITE_API_URL` environment variable set
- [ ] Build successful
- [ ] Frontend URL obtained
- [ ] Backend CORS updated with frontend URL
- [ ] Application tested
- [ ] Custom domain configured (optional)

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Vercel Discord: [vercel.com/discord](https://vercel.com/discord)
- Check Vercel dashboard logs for detailed error messages

---

**Your frontend is now live on Vercel! 🚀**

