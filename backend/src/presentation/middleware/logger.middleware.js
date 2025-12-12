import morgan from 'morgan';
import { logger } from '../../shared/logger.js';

// Configurar token personalizado para identificar usuario en logs
morgan.token('user-id', (req) => req.user?.id || 'anonymous');

const morganFormat = ':method :url :status :response-time ms - :user-id';

/**
 * Middleware genérico para logging de peticiones HTTP
 * Registra todas las peticiones usando Morgan integrado con Winston
 *
 * Uso:
 * app.use(httpLogger); // Después de los middlewares de parsing
 */
const httpLogger = morgan(morganFormat, {
  stream: logger.stream,
  skip: (req) => {
    // No loguear health checks en producción para reducir ruido
    return process.env.NODE_ENV === 'production' && req.url === '/health';
  },
});

export default httpLogger;
