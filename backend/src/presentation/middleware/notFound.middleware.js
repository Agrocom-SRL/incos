/**
 * Middleware genérico para manejo de rutas no encontradas (404)
 * Responde con formato estándar cuando una ruta no existe
 *
 * Uso:
 * app.use(notFoundHandler); // Después de todas las rutas, antes de errorHandler
 */
function notFoundHandler(req, res) {
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
