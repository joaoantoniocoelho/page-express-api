# 📦 Backend - Page Express

This is the backend of the Page Express project, responsible for the API and Supabase integration.

🧪 How to run locally

## Install dependencies
```bash
npm install
```

## Environment Variables
Create a `.env` file with:
```env
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=8080
```

## Run the project in dev mode
```bash
npm run dev
```

## 🔗 API Endpoints

- `GET /api/health` - Health check
- `GET /api/me` - Get current user data (requires auth)
- `POST /api/webhooks/clerk` - Clerk webhook for user creation

## 🗃️ Using Supabase

### 1. Login to Supabase CLI

```npx supabase login```

### 2. Connect to the project

```npx supabase link --project-ref <PROJECT_REF>```

### 3. Push migrations

```npx supabase db push```

### 4. Check migration status

```npx supabase db status```

### 5. Generate Supabase types

```npx supabase gen types typescript --local > src/types/supabase.ts```
