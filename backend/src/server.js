import 'dotenv/config';
import app from './app.js';
import { logger } from './config/logger.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
  logger.info(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API: http://localhost:${PORT}/api/v1`);
  logger.info(`📚 Docs: http://localhost:${PORT}/api-docs`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Apagando servidor...');
  logger.error(err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Cerrando servidor gracefully...');
  server.close(() => {
    logger.info('💥 Proceso terminado!');
  });
});

export default server;
