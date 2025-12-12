import 'dotenv/config';
import app from './app.js';
import { logger } from './config/logger.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Servidor corriendo en puerto ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`API: http://localhost:${PORT}/api/v1`);
    logger.info(`Docs: http://localhost:${PORT}/api-docs`);
  }
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection - Apagando servidor...', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido - Cerrando servidor gracefully...');
  server.close(() => {
    logger.info('Servidor cerrado correctamente');
  });
});

export default server;
