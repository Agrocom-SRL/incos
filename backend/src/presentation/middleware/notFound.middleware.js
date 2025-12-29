/**
 * Middleware genérico para manejo de rutas no encontradas (404)
 * Responde con formato estándar cuando una ruta no existe
 *
 * Uso:
 * app.use(notFoundHandler); // Después de todas las rutas, antes de errorHandler
 * 
 * NOTA: No intercepta rutas de archivos estáticos (/uploads, /public, etc.)
 */
function notFoundHandler(req, res, next) {
  // Ignorar rutas de archivos estáticos (ya fueron manejadas por express.static)
  if (req.originalUrl.startsWith('/uploads') || req.originalUrl.startsWith('/public')) {
    return next(); // Pasar al siguiente middleware (errorHandler)
  }
  
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Ruta ${req.originalUrl} no encontrada`,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}

export default notFoundHandler;
