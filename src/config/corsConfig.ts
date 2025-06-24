import { CorsOptions } from 'cors';

const getAllowedOrigins = (): string[] => {
  const origins = process.env.ALLOWED_ORIGINS;
  
  if (!origins) {
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
  }
  
  return origins.split(',').map(origin => origin.trim());
};

const allowedOrigins = getAllowedOrigins();

const trustedWebhookOrigins = ['https://api.clerk.dev'];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const isDev = process.env.NODE_ENV === 'development';
    const isProd = process.env.NODE_ENV === 'production';

    if (isDev) {
      if (!origin) {
        return callback(null, true); // Postman, curl, etc
      }

      if (origin && (allowedOrigins.includes(origin) || trustedWebhookOrigins.includes(origin))) {
        return callback(null, true);
      }
    }

    if (isProd) {
      if (origin && (allowedOrigins.includes(origin) || trustedWebhookOrigins.includes(origin))) {
        return callback(null, true);
      }
    }

    console.warn(`CORS: Access denied for origin: ${origin}`);
    return callback(new Error('Access denied for origin'), false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};
