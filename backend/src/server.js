import 'dotenv/config';
import { Application } from './infrastructure/bootstrap/Application.js';
import app from './app.js';

/**
 * Punto de entrada de la aplicación
 */
const application = new Application();

application
    .initialize()
    .then(() => application.start(app))
    .catch((error) => {
        console.error('Error fatal:', error);
        process.exit(1);
    });

export default application;