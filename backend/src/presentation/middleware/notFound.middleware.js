/**
 * Factory function para crear el middleware de manejo de rutas no encontradas (404)
 *
 * @returns {Function} Middleware de 404
 *
 * Middleware genérico para manejo de rutas no encontradas
 * Lanza NotFoundError (de domain/errors) que será capturado por errorHandler
 *
 * Uso:
 * const notFoundHandler = createNotFoundHandler();
 * app.use(notFoundHandler); // Después de todas las rutas, antes de errorHandler
 *
 * NOTA: No intercepta rutas de archivos estáticos (/uploads, /public, etc.)
 */
import { NotFoundError } from '../../domain/errors/AppError.js';

export function createNotFoundHandler() {
  return function notFoundHandler(req, res, next) {
    // Ignorar rutas de archivos estáticos (ya fueron manejadas por express.static)
    if (req.originalUrl.startsWith('/uploads') || req.originalUrl.startsWith('/public')) {
      return next(); // Pasar al siguiente middleware (errorHandler)
    }

    // Lanzar NotFoundError real (de domain/errors)
    // El errorHandler lo capturará y ErrorFormatter lo formateará
    const notFoundError = new NotFoundError(`Ruta ${req.originalUrl}`);
    return next(notFoundError);
  };
}

export default createNotFoundHandler;
