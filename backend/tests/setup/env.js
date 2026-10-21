// Entorno aislado de pruebas. Se ejecuta antes de cargar cualquier módulo de src/.
process.env.NODE_ENV = 'test';
// Respeta DB_NAME / DB_NAME_TEST si ya vienen definidos (CI de integración, BD descartable local);
// por defecto `incos_test`. Las demás variables DB_* (host, puerto, usuario, clave) no se pisan.
process.env.DB_NAME = process.env.DB_NAME_TEST || process.env.DB_NAME || 'incos_test';
process.env.JWT_SECRET = 'secreto-solo-para-pruebas';
process.env.JWT_EXPIRES_IN = '1h';
process.env.LOG_LEVEL = 'error';

// Guard: nunca correr pruebas contra una BD que no sea de prueba.
if (!process.env.DB_NAME.endsWith('_test')) {
  throw new Error(`DB_NAME debe terminar en "_test" (recibido: ${process.env.DB_NAME})`);
}
