import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';

import { corsConfig, helmetConfig } from '../config/security.config.js';
import { serverConfig } from '../config/server.config.js';
import { logger } from '../config/logger.config.js';

// Middleware de presentación
import httpLogger from '../../presentation/middleware/logger.middleware.js';
import errorHandler from '../../presentation/middleware/errorHandler.middleware.js';
import notFoundHandler from '../../presentation/middleware/notFound.middleware.js';

/**
 * Configuración de middleware de Express
 * 
 * Orden de middleware:
 * 1. Seguridad (Helmet, CORS)
 * 2. Parsing (JSON, URL-encoded)
 * 3. Utilidades (Cookie Parser, Compression)
 * 4. Logging HTTP
 * 5. Configuraciones especiales (Trust Proxy)
 * 6. Debugging (solo desarrollo)
 */
export function setupMiddleware(app) {
    // ============================================
    // 1. SEGURIDAD
    // ============================================
    app.use(helmet(helmetConfig));
    app.use(cors(corsConfig));
    app.options('*', cors(corsConfig)); // Preflight requests

    // ============================================
    // 2. BODY PARSING
    // ============================================
    app.use(express.json({ limit: serverConfig.bodyLimit }));
    app.use(
        express.urlencoded({
            extended: true,
            limit: serverConfig.bodyLimit,
        })
    );

    // ============================================
    // 3. UTILIDADES
    // ============================================
    app.use(cookieParser());
    app.use(compression());

    // ============================================
    // 4. HTTP LOGGING
    // ============================================
    app.use(httpLogger);

    // ============================================
    // 5. CONFIGURACIONES ESPECIALES
    // ============================================

    // Trust proxy (para producción detrás de Nginx)
    if (serverConfig.trustProxy) {
        app.set('trust proxy', 1);
        logger.info('Trust proxy habilitado');
    }

    // ============================================
    // 6. DEBUG LOGGING (solo desarrollo)
    // ============================================
    if (serverConfig.isDevelopment) {
        app.use((req, res, next) => {
            logger.debug('Request recibido:', {
                origin: req.headers.origin,
                method: req.method,
                url: req.url,
                ip: req.ip,
            });
            next();
        });
    }

    logger.info('Middleware configurado');
}

/**
 * Configuración de manejo de errores
 * Debe llamarse DESPUÉS de setupRoutes()
 */
export function setupErrorHandling(app) {
    // 404 handler
    app.use(notFoundHandler);

    // Error handler global
    app.use(errorHandler);

    logger.info('Manejo de errores configurado');
}