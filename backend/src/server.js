import 'dotenv/config';
import { Application } from './infrastructure/bootstrap/Application.js';
import app from './app.js';
import { logger } from './infrastructure/services/WinstonLoggerFactory.js';

/**
 * Punto de entrada de la aplicación
 */
const application = new Application();

application
    .initialize()
    .then(() => application.start(app))
    .catch((error) => {
        logger.error('Error fatal al iniciar', { error: error.message, stack: error.stack });
        process.exit(1);
    });

export default application;
