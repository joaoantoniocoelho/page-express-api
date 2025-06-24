# 📦 Backend - Page Express

This is the backend of the Page Express project, responsible for the API and Supabase integration.

🧪 How to run locally

## Install dependencies
```
npm install
```

## Run the project in dev mode
```
npm run dev
```
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
