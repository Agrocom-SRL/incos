// modules/estudiantes/connectors/index.js
/**
 * Exporta el connector por defecto para uso en rutas
 * Se usa: lazy(() => import('@estudiantes/connectors'))
 */
export { default } from './RegistrarConnector';
export { default as RegistrarConnector } from './RegistrarConnector';
