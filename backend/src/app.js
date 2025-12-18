import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import 'express-async-errors';

import httpLogger from './presentation/middleware/logger.middleware.js';
import errorHandler from './presentation/middleware/errorHandler.middleware.js';
import notFoundHandler from './presentation/middleware/notFound.middleware.js';
import routes from './presentation/routes/index.js';
import { logger } from './shared/logger.js';

const app = express();

// ============================================
// MIDDLEWARE GLOBAL
// ============================================

// Seguridad
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Deshabilitar CSP estricto si causa problemas
  })
);

// CORS - Configuración mejorada para producción
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origen (como Postman, curl, o navegador directo)
    if (!origin) {
      logger.debug('CORS: Request sin origen, permitido');
      return callback(null, true);
    }
    
    // Lista de orígenes permitidos
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'https://incos.wiiz.com.bo',
      'https://incos.wiiz.com.bo',
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    
    // Si el origen está en la lista, permitirlo
    if (allowedOrigins.includes(origin)) {
      logger.debug(`CORS: Origen permitido: ${origin}`);
      callback(null, true);
    } else {
      // En desarrollo, permitir cualquier origen
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`CORS: Origen permitido en desarrollo: ${origin}`);
        callback(null, true);
      } else {
        logger.warn(`CORS: Origen bloqueado: ${origin}`);
        callback(new Error('No permitido por CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
};

app.use(cors(corsOptions));

// Manejar preflight OPTIONS requests explícitamente
app.options('*', cors(corsOptions));

// Logging de CORS para debugging
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    logger.debug('Request headers:', {
      origin: req.headers.origin,
      'user-agent': req.headers['user-agent'],
      method: req.method,
      url: req.url,
      'access-control-request-method': req.headers['access-control-request-method'],
    });
    next();
  });
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compresión
app.use(compression());

// HTTP Logging
app.use(httpLogger);

// Trust proxy (para producción detrás de Nginx)
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API v1 routes
app.use('/api/v1', routes);

// Servir uploads (en desarrollo y producción)
// En producción, Nginx también hace proxy de /uploads/ pero esto sirve como fallback
app.use('/uploads', express.static('uploads'));

// API Docs (TODO: agregar swagger)
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'Documentación API en construcción',
    version: '1.0.0',
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Error handler global
app.use(errorHandler);

export default app;
