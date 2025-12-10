import morgan from 'morgan';
import { logger } from '../../config/logger.js';

// Formato personalizado
morgan.token('user-id', (req) => req.user?.id || 'anonymous');

const morganFormat = ':method :url :status :response-time ms - :user-id';

const httpLogger = morgan(morganFormat, {
  stream: logger.stream,
  skip: (req) => {
    // No loguear health checks en producción
    return process.env.NODE_ENV === 'production' && req.url === '/health';
  },
});

export default httpLogger;
