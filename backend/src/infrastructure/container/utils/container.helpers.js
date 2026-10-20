/**
 * Utilidades para el Container de Inyección de Dependencias
 *
 * Responsabilidades:
 * - Proporcionar funciones helper para registro seguro de dependencias
 * - Evitar duplicación de código en los containers
 * - Centralizar la lógica común de registro
 *
 * Principios aplicados:
 * - DRY: No repetir código en múltiples containers
 * - SRP: Una sola responsabilidad (registro seguro)
 * - DIP: Los containers dependen de abstracciones (helpers)
 */

/**
 * Registra un componente en el contenedor si no está ya registrado
 *
 * Esta función centraliza la lógica común de registro que se repite en todos los containers.
 * Previene registros duplicados y mantiene la consistencia.
 *
 * @param {Container} container - Contenedor de DI
 * @param {string} token - Token del componente
 * @param {Function} factory - Factory function que crea la instancia
 *
 * @example
 * registerComponent(container, TOKENS.logger, (c) => new Logger());
 * registerComponent(container, TOKENS.studentRepository, () => new StudentRepository());
 */
export function registerComponent(container, token, factory) {
    if (!container.has(token)) {
        container.register(token, factory);
    }
}

/**
 * Registra un repositorio en el contenedor si no está ya registrado
 *
 * Helper específico para repositorios que simplifica el registro de clases.
 *
 * @param {Container} container - Contenedor de DI
 * @param {string} token - Token del repositorio
 * @param {Function} RepositoryClass - Clase del repositorio
 *
 * @example
 * registerRepository(container, TOKENS.studentRepository, StudentRepository);
 */
export function registerRepository(container, token, RepositoryClass) {
    registerComponent(container, token, () => new RepositoryClass());
}

/**
 * Registra un servicio en el contenedor si no está ya registrado
 *
 * Helper específico para servicios que puede recibir una factory function o una instancia directa.
 *
 * @param {Container} container - Contenedor de DI
 * @param {string} token - Token del servicio
 * @param {Function|any} factoryOrInstance - Factory function o instancia directa
 *
 * @example
 * // Con factory function
 * registerService(container, TOKENS.validateRequest, (c) => createValidateRequest(c.resolve(TOKENS.logger)));
 *
 * // Con instancia directa
 * registerService(container, TOKENS.logger, loggerInstance);
 */
export function registerService(container, token, factoryOrInstance) {
    registerComponent(
        container,
        token,
        typeof factoryOrInstance === 'function' ? factoryOrInstance : () => factoryOrInstance
    );
}
