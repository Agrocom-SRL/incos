const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
require('express-async-errors');

const logger = require('./config/logger');
const httpLogger = require('./presentation/middleware/logger.middleware');
const errorHandler = require('./presentation/middleware/errorHandler.middleware');
const notFoundHandler = require('./presentation/middleware/notFound.middleware');

const app = express();

// ============================================
// MIDDLEWARE GLOBAL
// ============================================

// Seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

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
    environment: process.env.NODE_ENV
  });
});

// API v1 routes
app.use('/api/v1', require('./presentation/routes'));

// Servir uploads (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use('/uploads', express.static('uploads'));
}

// API Docs (TODO: agregar swagger)
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'Documentación API en construcción',
    version: '1.0.0'
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Error handler global
app.use(errorHandler);

module.exports = app;
