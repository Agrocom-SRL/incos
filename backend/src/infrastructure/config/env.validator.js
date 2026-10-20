import 'dotenv/config';

/**
 * Helpers para obtener variables de entorno con valores por defecto
 *
 * Cada archivo de configuración (database.config.js, server.config.js, etc.)
 * usa estos helpers y define sus propios valores por defecto.
 */

/**
 * Obtiene una variable de entorno con valor por defecto
 * @param {string} key - Nombre de la variable
 * @param {any} defaultValue - Valor por defecto si no existe
 * @returns {string|any} Valor de la variable o default
 */
export function getEnv(key, defaultValue = undefined) {
    return process.env[key] ?? defaultValue;
}

/**
 * Obtiene una variable de entorno como número
 * @param {string} key - Nombre de la variable
 * @param {number} defaultValue - Valor por defecto si no existe
 * @returns {number} Valor numérico de la variable o default
 */
export function getEnvAsNumber(key, defaultValue = 0) {
    const value = process.env[key];
    return value ? parseInt(value, 10) : defaultValue;
}

/**
 * Obtiene una variable de entorno como booleano
 * @param {string} key - Nombre de la variable
 * @param {boolean} defaultValue - Valor por defecto si no existe
 * @returns {boolean} Valor booleano de la variable o default
 */
export function getEnvAsBoolean(key, defaultValue = false) {
    const value = process.env[key]?.toLowerCase();
    if (!value) return defaultValue;
    return ['true', '1', 'yes'].includes(value);
}
