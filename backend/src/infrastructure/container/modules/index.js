/**
 * Contenedor de Dependency Injection - Version simplificada
 * 
 * NOTA: Los controladores ahora importan repositorios directamente.
 * Este contenedor se mantiene solo para compatibilidad con codigo legacy.
 * Implementacion minima sin dependencias.
 */
import { logger } from '../../../shared/logger.js';

// Contenedor minimo - solo para compatibilidad
class SimpleContainer {
  constructor() {
    this.services = new Map();
    this.services.set('logger', logger);
  }

  register(name, factory, singleton = false) {
    this.services.set(name, singleton ? factory() : factory);
  }

  resolve(name) {
    if (!this.services.has(name)) {
      throw new Error(`Service '${name}' not found in container`);
    }
    return this.services.get(name);
  }

  has(name) {
    return this.services.has(name);
  }
}

export const container = new SimpleContainer();
export default container;
