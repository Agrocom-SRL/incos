/**
 * Contenedor de Dependency Injection
 * Gestiona las dependencias de la aplicación de forma centralizada
 */
export class Container {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  /**
   * Registra un servicio en el contenedor
   * @param {string} name - Nombre del servicio
   * @param {Function|Object} factory - Factory function o instancia
   * @param {boolean} singleton - Si es singleton (instancia única)
   */
  register(name, factory, singleton = true) {
    this.services.set(name, {
      factory,
      singleton,
    });
    return this;
  }

  /**
   * Obtiene una instancia del servicio
   * @param {string} name - Nombre del servicio
   * @returns {*} Instancia del servicio
   */
  resolve(name) {
    const service = this.services.get(name);

    if (!service) {
      throw new Error(`Service '${name}' not found in container`);
    }

    // Si es singleton y ya existe, devolver la instancia existente
    if (service.singleton && this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    // Crear nueva instancia
    let instance;
    if (typeof service.factory === 'function') {
      // Si es una función, ejecutarla (puede ser factory o clase)
      instance = service.factory(this);
    } else {
      // Si es un valor directo, usarlo
      instance = service.factory;
    }

    // Si es singleton, guardarlo
    if (service.singleton) {
      this.singletons.set(name, instance);
    }

    return instance;
  }

  /**
   * Verifica si un servicio está registrado
   * @param {string} name - Nombre del servicio
   * @returns {boolean}
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * Limpia todas las instancias singleton (útil para tests)
   */
  clear() {
    this.singletons.clear();
  }
}

// Instancia global del contenedor
export const container = new Container();
