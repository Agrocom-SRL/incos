import express from 'express';
import 'express-async-errors';
import { setupMiddleware } from './middleware.config.js';
import { setupRoutes } from './routes.config.js';
import { setupStaticFiles } from './static.config.js';
import container from '../container/index.js';
import { SERVICIOS_TOKENS } from '../container/tokens/index.js';

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
        // Obtener dependencias del container (únicamente aquí en la raíz)
        const logger = container.resolve(SERVICIOS_TOKENS.logger);
        const errorFormatter = container.resolve(SERVICIOS_TOKENS.errorFormatter);
        
        logger.info('Configurando Express...');

        // 1. Middleware global (seguridad, parsing, logging) - logger inyectado
        setupMiddleware(this.app, logger);

        // 2. Archivos estáticos (ANTES de las rutas para que tengan prioridad) - logger inyectado
        setupStaticFiles(this.app, logger);

        // 3. Rutas de la aplicación - logger y errorFormatter inyectados
        setupRoutes(this.app, logger, errorFormatter);

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