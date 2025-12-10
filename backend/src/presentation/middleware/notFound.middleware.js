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
