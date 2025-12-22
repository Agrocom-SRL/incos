import express from 'express';
import 'express-async-errors';
import { setupMiddleware } from './middleware.config.js';
import { setupRoutes } from './routes.config.js';
import { setupStaticFiles } from './static.config.js';
import { logger } from '../config/logger.config.js';

/**
 * Clase de configuración de Express
 * 
 * Responsabilidades:
 * - Crear instancia de Express
 * - Orquestar la configuración de middleware, rutas y archivos estáticos
 * - NO inicia el servidor (eso lo hace Application.js)
 */
export class ExpressApp {
    constructor() {
        this.app = express();
        this.configure();
    }

    /**
     * Configurar la aplicación Express
     */
    configure() {
        logger.info('Configurando Express...');

        // 1. Middleware global (seguridad, parsing, logging)
        setupMiddleware(this.app);

        // 2. Rutas de la aplicación
        setupRoutes(this.app);

        // 3. Archivos estáticos
        setupStaticFiles(this.app);

        logger.info('Express configurado correctamente');
    }

    /**
     * Obtener la instancia de Express
     */
    getApp() {
        return this.app;
    }
}

export default ExpressApp;