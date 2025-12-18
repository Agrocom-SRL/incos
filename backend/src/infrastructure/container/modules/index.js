/**
 * Contenedor de Dependency Injection - Version simplificada
 * 
 * NOTA: Los controladores ahora importan repositorios directamente.
 * Este contenedor se mantiene solo para compatibilidad con codigo legacy.
 */
import { Container } from '../Container.js';
import { logger } from '../../../shared/logger.js';

// Crear instancia del contenedor vacia
export const container = new Container();

// Registrar solo el logger como servicio global
container.register('logger', () => logger, true);

// Los modulos se registran bajo demanda cuando se necesiten
// No se registran automaticamente para evitar problemas de inicializacion

export default container;
