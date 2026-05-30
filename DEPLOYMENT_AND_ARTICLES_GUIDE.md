# Wildleaf Journal - Deployment & Article Management Guide

Complete guide to manage articles and deploy your blogging platform to Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Article Management](#local-article-management)
3. [Vercel Deployment](#vercel-deployment)
4. [Production Article Management](#production-article-management)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Local Development
- **Node.js** 20+ and **pnpm** installed
- **PowerShell** (for API requests)
- Both API and Frontend running locally:
  ```powershell
  # Terminal 1: API Server
  cd artifacts/api-server
  pnpm run dev
  # Runs on http://localhost:3000

  # Terminal 2: Frontend
  cd artifacts/nature-platform
  pnpm run dev
  # Runs on http://localhost:5173
  ```

### Vercel Deployment
- **Vercel CLI** installed:
  ```powershell
  npm i -g vercel
  ```
- GitHub repository connected to Vercel
- Database credentials ready (Neon PostgreSQL)
- Admin API token ready

---

## Local Article Management

### Step 1: Start the Servers

Open two PowerShell terminals:

**Terminal 1 - API Server:**
```powershell
cd artifacts/api-server
pnpm run dev
```
Wait until you see: `Server running on port 3000`

**Terminal 2 - Frontend:**
```powershell
cd artifacts/nature-platform
pnpm run dev
```
Wait until you see: `Local: http://localhost:5173/`

### Step 2: Authenticate as Admin

Set your admin token and log in:

```powershell
$env:ADMIN_API_TOKEN = "nBLclz08_rlDLwD7IxGxiiv0oFxkqc-NlwzilvAUdfk"

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Invoke-WebRequest `
  -Uri "http://localhost:3000/api/admin/login" `
  -Method Post `
  -Headers @{ Authorization = "Bearer $env:ADMIN_API_TOKEN" } `
  -WebSession $session `
  | Out-Null

Write-Host "✓ Logged in successfully"
```

### Step 3: Create an Article

```powershell
$articleBody = @{
  title = "My First Article"
  slug = "my-first-article"
  excerpt = "A brief introduction to my article"
  content = "# Heading

This is the main content of my article in **Markdown** format.

## Subheading

More content here..."
  category = "nature"
  readTime = 5
  featured = $false
  status = "published"
  categoryId = 1
  imageUrl = "https://example.com/image.jpg"
  imageAlt = "Description of the image"
  wordCount = 800
  seoTitle = "My First Article - Wildleaf Journal"
  seoDescription = "Read about my first article on Wildleaf Journal"
  tagIds = @(1)
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/articles" `
  -Method Post `
  -ContentType "application/json" `
  -Body $articleBody `
  -WebSession $session | ConvertTo-Json | Write-Host
```

**Expected Response:**
```json
{
  "id": 3,
  "slug": "my-first-article",
  "title": "My First Article",
  "status": "published",
  "createdAt": "2026-05-29T10:30:00.000Z"
}
```

### Step 4: View Your Article

Visit: `http://localhost:5173/articles` - Your article should appear in the list.

### Step 5: Update an Article

```powershell
$updateBody = @{
  title = "My First Article - Updated"
  excerpt = "Updated excerpt"
  content = "Updated content..."
  imageUrl = "https://example.com/new-image.jpg"
  imageAlt = "New image description"
  featured = $true
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/articles/my-first-article" `
  -Method Put `
  -ContentType "application/json" `
  -Body $updateBody `
  -WebSession $session | ConvertTo-Json | Write-Host
```

### Step 6: Get All Tags (for tagIds)

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/api/tags" `
  -Method Get | ConvertTo-Json | Write-Host
```

Returns available tags to use in `tagIds` field.

---

## Vercel Deployment

### Phase 1: Deploy API Server

#### Step 1: Prepare API Environment

The API server needs these environment variables on Vercel:

```
DATABASE_URL=postgresql://neondb_owner:npg_ksrN7ml3fvwj@ep-snowy-unit-aokv22dp-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
ADMIN_API_TOKEN=nBLclz08_rlDLwD7IxGxiiv0oFxkqc-NlwzilvAUdfk
NODE_ENV=production
PORT=3000
PGUSER=neondb_owner
PGPASSWORD=npg_ksrN7ml3fvwj
```

See `artifacts/api-server/.env.production` in your repo.

#### Step 2: Deploy API via CLI

```powershell
cd artifacts/api-server
vercel --prod
```

Follow the prompts:
- Select "Create a new project"
- Project name: `wildleaf-api` (or your choice)
- Add environment variables when prompted, or do it after in dashboard

**Save the API URL from the output**, e.g.: `https://wildleaf-api.vercel.app`

#### Step 3: Verify API is Live

```powershell
$apiUrl = "https://wildleaf-api.vercel.app"

Invoke-RestMethod `
  -Uri "$apiUrl/api/health" `
  -Method Get | ConvertTo-Json | Write-Host
```

Should return `{"status":"ok"}`.

---

### Phase 2: Deploy Frontend

#### Step 1: Get API URL

From Phase 1 above, you have your API URL. Example: `https://wildleaf-api.vercel.app`

#### Step 2: Deploy Frontend

```powershell
cd artifacts/nature-platform
vercel --prod
```

Follow the prompts:
- Select "Create a new project"
- Project name: `wildleaf` (or your choice)

#### Step 3: Add Environment Variables to Frontend Project

After deployment, go to Vercel Dashboard → Your Frontend Project → Settings → Environment Variables

Add:
```
VITE_API_BASE_URL = https://wildleaf-api.vercel.app
API_BASE_URL = https://wildleaf-api.vercel.app
```

Replace `https://wildleaf-api.vercel.app` with your actual API URL from Phase 1.

#### Step 4: Redeploy Frontend

```powershell
cd artifacts/nature-platform
vercel --prod
```

This redeploy will pick up the new environment variables.

**Save the Frontend URL**, e.g.: `https://wildleaf.vercel.app`

#### Step 5: Verify Frontend is Live

Open in browser: `https://wildleaf.vercel.app`

You should see your homepage with all articles that existed when you deployed.

---

## Image Management

### How Images Work

The `imageUrl` field stores a **URL string** in the database. It doesn't matter where the image physically exists—it just needs to be accessible via a public URL.

#### Local Development vs Production

**Local (http://localhost:5173):**
```powershell
# These work locally:
imageUrl = "https://example.com/image.jpg"           # ✓ Remote URL
imageUrl = "file:///C:/Users/me/image.jpg"           # ✓ Local file path
```

**Production (Vercel):**
```powershell
# Only publicly accessible URLs work:
imageUrl = "https://cloudinary.com/my-image.jpg"     # ✓ Works
imageUrl = "https://s3.amazonaws.com/my-image.jpg"   # ✓ Works
imageUrl = "file:///C:/Users/me/image.jpg"           # ✗ Broken (404)
```

### Image Lifecycle

| Scenario | What Happens |
|----------|--------------|
| Create article with image URL | URL stored in database ✓ |
| Image deleted from cloud storage | Broken image on website (404) ✗ |
| Update article with new image URL | New image shows on next redeploy |
| Delete article | Article deleted, but cloud image remains |
| Local image deleted | No effect (URL exists independently) |

**Key Point**: Deleting local files **does NOT** delete images on your website. Images are independent of your local machine once deployed.

### Best Practices for Images

#### Option 1: Cloudinary (Recommended - Free, Easy)

1. Sign up: https://cloudinary.com (free tier available)
2. Go to Dashboard → Media Library
3. Click "Upload" and upload your image
4. Copy the image URL (e.g., `https://res.cloudinary.com/your-account/image/upload/v123456/image.jpg`)
5. Use in your article:

```powershell
$articleBody = @{
  title = "My Article"
  imageUrl = "https://res.cloudinary.com/your-account/image/upload/v123456/image.jpg"
  imageAlt = "Description of image"
  # ... other fields
} | ConvertTo-Json
```

#### Option 2: AWS S3

1. Create S3 bucket with public read access
2. Upload image to bucket
3. Get public URL: `https://your-bucket.s3.amazonaws.com/image.jpg`
4. Use in article

#### Option 3: GitHub (Free for small images)

1. Create `public/images/` folder in your repo
2. Add image and commit: `git add public/images/my-image.jpg`
3. Push to GitHub
4. Use URL: `https://raw.githubusercontent.com/your-username/your-repo/main/public/images/my-image.jpg`

#### Option 4: Vercel Blob Storage

1. Install: `vercel env pull`
2. Upload image via Vercel dashboard
3. Get public URL and use in article

### Image URL Examples

```powershell
# Valid for production:
"https://cloudinary.com/my-image.jpg"
"https://imgur.com/abc123.jpg"
"https://raw.githubusercontent.com/user/repo/main/image.jpg"
"https://s3.amazonaws.com/bucket/image.jpg"

# NOT valid for production:
"file:///C:/Users/me/image.jpg"      # Local path
"./images/image.jpg"                  # Relative path
"/images/image.jpg"                   # Server path
```

---

## Production Article Management

Now your site is live on Vercel. Here's how to add/update articles:

### Add a New Article

Same as local workflow, but change the API URL:

```powershell
# Step 1: Set credentials
$env:ADMIN_API_TOKEN = "nBLclz08_rlDLwD7IxGxiiv0oFxkqc-NlwzilvAUdfk"
$apiUrl = "https://wildleaf-api.vercel.app"  # Your production API URL

# Step 2: Login
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Invoke-WebRequest `
  -Uri "$apiUrl/api/admin/login" `
  -Method Post `
  -Headers @{ Authorization = "Bearer $env:ADMIN_API_TOKEN" } `
  -WebSession $session | Out-Null

# Step 3: Create article
$articleBody = @{
  title = "New Production Article"
  slug = "new-production-article"
  excerpt = "This article will be published live"
  content = "# Content here..."
  category = "nature"
  readTime = 5
  featured = $false
  status = "published"
  categoryId = 1
  tagIds = @(1)
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "$apiUrl/api/articles" `
  -Method Post `
  -ContentType "application/json" `
  -Body $articleBody `
  -WebSession $session | ConvertTo-Json | Write-Host
```

### Publish the Article on Your Website

After creating the article, you must redeploy the frontend to regenerate the static HTML:

```powershell
cd artifacts/nature-platform
vercel --prod
```

This triggers the prerender script, which:
1. Fetches all articles from your API (including the new one)
2. Generates static HTML pages
3. Deploys to Vercel

**Wait for deployment to complete** (~2-3 minutes).

Visit `https://wildleaf.vercel.app/articles` and your new article will be there.

### Update an Article

Same process:

```powershell
$updateBody = @{
  title = "Updated Title"
  content = "Updated content..."
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "$apiUrl/api/articles/new-production-article" `
  -Method Put `
  -ContentType "application/json" `
  -Body $updateBody `
  -WebSession $session | ConvertTo-Json | Write-Host
```

Then redeploy frontend:
```powershell
cd artifacts/nature-platform
vercel --prod
```

---

## Troubleshooting

### Article appears in API but not on website

**Cause**: Frontend hasn't been redeployed after creating the article.

**Solution**: Run `vercel --prod` in `artifacts/nature-platform` folder.

### "Cannot login" error

**Cause**: Wrong admin token or API URL.

**Solution**: 
- Check `ADMIN_API_TOKEN` environment variable is set
- Verify API URL is correct (should be your Vercel API domain)
- Test with: `Invoke-RestMethod -Uri "$apiUrl/api/health" -Method Get`

### "Database connection refused"

**Cause**: DATABASE_URL not set or invalid in Vercel environment.

**Solution**:
- Go to Vercel Dashboard → API Project → Settings → Environment Variables
- Verify `DATABASE_URL` is exactly:
  ```
  postgresql://neondb_owner:npg_ksrN7ml3fvwj@ep-snowy-unit-aokv22dp-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
  ```

### Frontend shows "API connection failed"

**Cause**: `VITE_API_BASE_URL` not set or incorrect in frontend environment.

**Solution**:
- Go to Vercel Dashboard → Frontend Project → Settings → Environment Variables
- Add/update:
  ```
  VITE_API_BASE_URL = https://your-api-domain.vercel.app
  ```
- Redeploy: `vercel --prod`

### Prerender script fails during deploy

**Cause**: API is down or unreachable during prerender.

**Solution**:
- Verify API is running: `curl https://your-api-domain.vercel.app/api/health`
- Check environment variables in frontend project
- Redeploy: `vercel --prod`

---

## Quick Reference Commands

### Local Development
```powershell
# Terminal 1: API
cd artifacts/api-server
pnpm run dev

# Terminal 2: Frontend
cd artifacts/nature-platform
pnpm run dev
```

### Create Article (Local)
```powershell
$env:ADMIN_API_TOKEN = "nBLclz08_rlDLwD7IxGxiiv0oFxkqc-NlwzilvAUdfk"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/login" -Method Post -Headers @{ Authorization = "Bearer $env:ADMIN_API_TOKEN" } -WebSession $session | Out-Null
# Then POST to http://localhost:3000/api/articles
```

### Deploy to Vercel
```powershell
# Deploy API
cd artifacts/api-server
vercel --prod

# Deploy Frontend (after updating VITE_API_BASE_URL in Vercel dashboard)
cd ../nature-platform
vercel --prod
```

### Create Article (Production)
```powershell
$env:ADMIN_API_TOKEN = "nBLclz08_rlDLwD7IxGxiiv0oFxkqc-NlwzilvAUdfk"
$apiUrl = "https://wildleaf-api.vercel.app"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Invoke-WebRequest -Uri "$apiUrl/api/admin/login" -Method Post -Headers @{ Authorization = "Bearer $env:ADMIN_API_TOKEN" } -WebSession $session | Out-Null
# Then POST to $apiUrl/api/articles
# Then: cd artifacts/nature-platform && vercel --prod
```

---

## Support

For issues or questions, refer to:
- API docs: `artifacts/api-server/README.md`
- Frontend docs: `artifacts/nature-platform/README.md`
- Root README: `README.md`
