# 🔥 LifeOS — Your Life Operating System

## 🚀 Deploy — Sirf 5 Steps

### STEP 1 — GitHub pe Upload
1. https://github.com jao → Login
2. New repository → name: lifeos → Private → Create
3. "uploading an existing file" click karo
4. Saare files drag & drop karo
5. Commit changes

### STEP 2 — Fly.io pe Database
1. https://fly.io → Login
2. Left side "Managed Postgres" → "Create cluster"
3. Name: lifeos-db → Free plan → Create
4. 2 minute wait
5. Left side "Connect" click karo
6. "Pooled connection URL" copy karo → Notepad mein save (DATABASE_URL)
7. "Direct connection URL" copy karo → Notepad mein save (DIRECT_URL)

### STEP 3 — Secret Keys
1. https://generate-secret.vercel.app/32 → copy → SECRET_1
2. Refresh → copy → SECRET_2

### STEP 4 — Vercel Deploy
1. https://vercel.com → GitHub se login
2. Add New Project → lifeos import
3. Environment Variables add karo:
   - DATABASE_URL = Pooled URL (pgbouncer wali)
   - DIRECT_URL = Direct URL (direct wali)
   - NEXTAUTH_SECRET = SECRET_1
   - JWT_SECRET = SECRET_2
   - NEXTAUTH_URL = https://tumhara-project.vercel.app
   - NEXT_PUBLIC_APP_URL = https://tumhara-project.vercel.app
4. Deploy dabao

### STEP 5 — URL Fix
1. Exact Vercel URL copy karo
2. Settings → Environment Variables
3. NEXTAUTH_URL aur NEXT_PUBLIC_APP_URL update karo
4. Redeploy karo
