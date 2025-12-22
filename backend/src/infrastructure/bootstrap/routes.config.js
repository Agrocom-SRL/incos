import routes from '../../presentation/routes/index.js';
import { serverConfig } from '../config/server.config.js';
import { logger } from '../config/logger.config.js';
import { setupErrorHandling } from './middleware.config.js';

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
    // API DOCUMENTATION
    // ============================================
    app.get('/api-docs', (req, res) => {
        res.json({
            message: 'Documentación API en construcción',
            version: '1.0.0',
            endpoints: {
                health: '/health',
                api: '/api/v1',
                estudiantes: '/api/v1/estudiantes',
                catalogs: '/api/v1/catalogs',
            },
        });
    });

    // ============================================
    // ERROR HANDLING (debe ir al final)
    // ============================================
    setupErrorHandling(app);

    logger.info('Rutas configuradas');
}