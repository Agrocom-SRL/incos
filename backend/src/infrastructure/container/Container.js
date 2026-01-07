/**
 * Contenedor de Inyección de Dependencias (DI Container)
 * 
 * Implementa el patrón Service Locator para gestionar dependencias.
 * Todas las dependencias se registran como singletons (una sola instancia compartida).
 * 
 * Responsabilidades:
 * - Registrar servicios/repositorios/use cases
 * - Resolver dependencias automáticamente
 * - Gestionar ciclo de vida singleton (una instancia por token)
 * 
 * @example
 * const container = new Container();
 * container.register('logger', () => new Logger());
 * const logger = container.resolve('logger');
 */
export class Container {
    constructor() {
        /**
         * Mapa de proveedores registrados
         * @type {Map<string, Function>}
         */
        this.providers = new Map();

        /**
         * Instancias singleton cacheadas
         * @type {Map<string, any>}
         */
        this.instances = new Map();
    }

    /**
     * Registra un proveedor de dependencia como singleton
     * 
     * @param {string} token - Identificador único del servicio
     * @param {Function} factory - Función que crea la instancia
     * 
     * @throws {Error} Si el token ya está registrado o los parámetros son inválidos
     * 
     * @example
     * container.register('logger', () => new Logger());
     * container.register('studentRepository', () => new StudentRepository());
     */
    register(token, factory) {
        if (!token || typeof token !== 'string') {
            const error = new Error(`DI: Token inválido. Debe ser un string no vacío: "${token}"`);
            console.error('[Container]', error.message);
            throw error;
        }

        if (typeof factory !== 'function') {
            const error = new Error(`DI: Factory debe ser una función para el token: "${token}"`);
            console.error('[Container]', error.message);
            throw error;
        }

        if (this.providers.has(token)) {
            const error = new Error(`DI: Token ya registrado: "${token}"`);
            console.error('[Container]', error.message);
            throw error;
        }

        this.providers.set(token, factory);
    }

    /**
     * Resuelve una dependencia por su token
     * 
     * @param {string} token - Identificador del servicio
     * @returns {any} Instancia del servicio (singleton)
     * @throws {Error} Si el token no está registrado
     * 
     * @example
     * const logger = container.resolve('logger');
     * logger.info('Hello');
     */
    resolve(token) {
        const factory = this.providers.get(token);

        if (!factory) {
            const error = new Error(`DI: Provider no encontrado: "${token}"`);
            console.error('[Container]', error.message);
            throw error;
        }

        // Si ya existe instancia cacheada, reutilizarla
        if (this.instances.has(token)) {
            return this.instances.get(token);
        }

        // Crear y cachear instancia singleton
        const instance = factory(this);
        this.instances.set(token, instance);
        return instance;
    }

    /**
     * Verifica si un token está registrado
     * 
     * @param {string} token - Identificador del servicio
     * @returns {boolean} True si el token está registrado
     */
    has(token) {
        if (!token || typeof token !== 'string') {
            return false;
        }
        return this.providers.has(token);
    }

    // Versión minimalista: no se exponen métodos de debug/testing
}