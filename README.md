# 📦 Backend - Page Express

Este é o backend do projeto Page Express, responsável pela API e integração com o Supabase.

🧪 Como rodar localmente

## Instalar dependências
```
npm install
```

## Rodar o projeto em modo dev
```
npm run dev
```
## 🗃️ Usando o Supabase

### 1. Login na CLI do Supabase

```npx supabase login```

### 2. Conectar ao projeto

```npx supabase link --project-ref <PROJECT_REF>```

### 3. Subir migrations

```npx supabase db push```

### 4. Verificar status das migrations

```npx supabase db status```

### 5. Gerar types do Supabase

```npx supabase gen types typescript --local > src/types/supabase.ts```

📁 Estrutura esperada

backend/
├── src/
│   ├── routes/
│   ├── services/
│   └── types/
├── .env.example
├── package.json
└── tsconfig.json

