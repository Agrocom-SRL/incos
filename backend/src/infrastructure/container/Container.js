/**
 * Contenedor de Dependency Injection
 * Gestiona las dependencias de la aplicación de forma centralizada
 *
 * Uso:
 * const container = new Container();
 * container.register('serviceName', () => new Service(), true);
 * const service = container.resolve('serviceName');
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
   * @returns {Container} Retorna this para encadenamiento
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
   * @throws {Error} Si el servicio no está registrado
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
      // Si es una función, ejecutarla pasando el container como contexto
      // Esto permite que la factory resuelva otras dependencias
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
