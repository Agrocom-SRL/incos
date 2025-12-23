/**
 * Contenedor de Inyección de Dependencias (DI Container)
 * 
 * Implementa el patrón Service Locator para gestionar dependencias.
 * 
 * Responsabilidades:
 * - Registrar servicios/repositorios/use cases
 * - Resolver dependencias automáticamente
 * - Gestionar ciclo de vida (singleton vs transient)
 * 
 * @example
 * const container = new Container();
 * container.register('logger', () => new Logger(), { singleton: true });
 * const logger = container.resolve('logger');
 */
export class Container {
    constructor() {
        /**
         * Mapa de proveedores registrados
         * @type {Map<string, {factory: Function, singleton: boolean}>}
         */
        this.providers = new Map();

        /**
         * Instancias singleton cacheadas
         * @type {Map<string, any>}
         */
        this.instances = new Map();
    }

    /**
     * Registra un proveedor de dependencia
     * 
     * @param {string} token - Identificador único del servicio
     * @param {Function} factory - Función que crea la instancia
     * @param {Object} options - Opciones de registro
     * @param {boolean} options.singleton - Si es singleton (default: true)
     * 
     * @example
     * container.register('logger', () => new Logger(), { singleton: true });
     * container.register('requestId', () => uuid(), { singleton: false });
     */
    register(token, factory, { singleton = true } = {}) {
        this.providers.set(token, { factory, singleton });
    }

    /**
     * Resuelve una dependencia por su token
     * 
     * @param {string} token - Identificador del servicio
     * @returns {any} Instancia del servicio
     * @throws {Error} Si el token no está registrado
     * 
     * @example
     * const logger = container.resolve('logger');
     * logger.info('Hello');
     */
    resolve(token) {
        const provider = this.providers.get(token);

        if (!provider) {
            throw new Error(`DI: Provider no encontrado: "${token}"`);
        }

        // Si no es singleton, crear nueva instancia cada vez
        if (!provider.singleton) {
            return provider.factory(this);
        }

        // Si es singleton, reutilizar instancia cacheada
        if (this.instances.has(token)) {
            return this.instances.get(token);
        }

        // Crear y cachear instancia singleton
        const instance = provider.factory(this);
        this.instances.set(token, instance);
        return instance;
    }

    /**
     * Verifica si un token está registrado
     * 
     * @param {string} token - Identificador del servicio
     * @returns {boolean}
     */
    has(token) {
        return this.providers.has(token);
    }

    /**
     * Sobrescribe un proveedor existente
     * Útil para testing (mock de dependencias)
     * 
     * @param {string} token - Identificador del servicio
     * @param {Function} factory - Nueva función factory
     * @param {Object} options - Opciones de registro
     * 
     * @example
     * // En tests:
     * container.override('logger', () => new MockLogger());
     */
    override(token, factory, { singleton = true } = {}) {
        this.providers.set(token, { factory, singleton });
        this.instances.delete(token); // Limpiar cache
    }

    /**
     * Limpia todas las instancias singleton
     * Útil para testing
     */
    clear() {
        this.instances.clear();
    }

    /**
     * Elimina un proveedor
     * 
     * @param {string} token - Identificador del servicio
     */
    unregister(token) {
        this.providers.delete(token);
        this.instances.delete(token);
    }
}