import routes from '../../presentation/routes/index.js';
import { serverConfig } from '../config/server.config.js';
import { logger } from '../config/logger.config.js';
import { setupErrorHandling } from './middleware.config.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../config/swagger.config.js';

/**
 * Configuración de rutas de Express
 * 
 * Incluye:
 * - Health check
 * - API v1 routes
 * - API docs
 * - Manejo de errores (404, 500)
 */
export function setupRoutes(app) {
    // ============================================
    // HEALTH CHECK
    // ============================================
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: serverConfig.nodeEnv,
            version: '1.0.0',
        });
    });

    // ============================================
    // API V1 ROUTES
    // ============================================
    app.use('/api/v1', routes);

    // ============================================
    // API DOCUMENTATION (Swagger UI)
    // ============================================
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'API Instituto INCOS - Documentación',
        customfavIcon: '/favicon.ico',
    }));

    // Endpoint JSON de la especificación OpenAPI
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    // ============================================
    // ERROR HANDLING (debe ir al final)
    // ============================================
    setupErrorHandling(app);

    logger.info('Rutas configuradas');
}