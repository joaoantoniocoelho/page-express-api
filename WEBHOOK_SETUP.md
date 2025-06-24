# Configuração do Webhook do Clerk

## Configuração no Dashboard do Clerk

1. Acesse o [Dashboard do Clerk](https://dashboard.clerk.com)
2. Selecione seu projeto
3. Vá para **Webhooks** no menu lateral
4. Clique em **Add Endpoint**
5. Configure:
   - **Endpoint URL**: `https://seu-dominio.com/api/webhooks/clerk`
   - **Events**: Selecione `user.created`

## Variáveis de Ambiente

Adicione a seguinte variável ao seu arquivo `.env`:

```env
CLERK_WEBHOOK_SECRET=whsec_sua_chave_secreta_aqui
```

> **Importante**: A chave secreta será fornecida pelo Clerk após criar o endpoint.

## Como Funciona

- Quando um usuário se registra via Clerk, um evento `user.created` é enviado para seu webhook
- O webhook valida a assinatura para garantir segurança
- Se válido, cria automaticamente o usuário no Supabase
- O endpoint `/api/register` foi removido - não é mais necessário

## Testando

Para testar o webhook localmente, você pode usar o [ngrok](https://ngrok.com/):

```bash
# Instalar ngrok (se ainda não tiver)
npm install -g ngrok

# Expor sua aplicação local
ngrok http 8080

# Use a URL gerada pelo ngrok no dashboard do Clerk
```

## Logs

O webhook gera logs detalhados:
- Eventos ignorados (que não são `user.created`)
- Usuários já existentes
- Criação bem-sucedida de usuários
- Erros de validação ou banco de dados 