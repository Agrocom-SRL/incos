import morgan from 'morgan';

// Configurar token personalizado para identificar usuario en logs
morgan.token('user-id', (req) => req.user?.id || 'anonymous');

const morganFormat = ':method :url :status :response-time ms - :user-id';

/**
 * Factory function para crear el middleware de logging HTTP
 *
 * @param {ILogger} logger - Logger inyectado del container (debe tener propiedad stream)
 * @returns {Function} Middleware de logging HTTP
 *
 * Middleware genérico para logging de peticiones HTTP
 * Registra todas las peticiones usando Morgan integrado con Winston
 *
 * Uso:
 * const httpLogger = createHttpLogger(logger);
 * app.use(httpLogger); // Después de los middlewares de parsing
 */
export function createHttpLogger(logger) {
  return morgan(morganFormat, {
    stream: logger.stream,
    skip: (req) => {
      // No loguear health checks en producción para reducir ruido
      return process.env.NODE_ENV === 'production' && req.url === '/health';
    },
  });
}

// Export por defecto para compatibilidad (usará logger del container)
// NOTA: Se recomienda usar createHttpLogger(logger) con logger del container
export default createHttpLogger;
