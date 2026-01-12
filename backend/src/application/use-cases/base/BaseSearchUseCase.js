/**
 * Use Case Base para operaciones de búsqueda por texto libre
 * 
 * Implementa el patrón Template Method para proporcionar funcionalidad común
 * a todos los casos de uso de búsqueda
 * 
 * Responsabilidades:
 * - Ejecutar búsqueda en el repositorio (usa getSearchFields() del repositorio)
 * - Manejar límite de resultados parametrizable
 * - Registrar logs durante la operación
 * - Retornar resultado estandarizado
 * 
 * NOTA: La validación del término de búsqueda y el límite se realiza en las rutas
 * mediante el validator común (searchValidator), por lo que este use case
 * asume que searchTerm y limit ya están validados.
 * 
 * Principios SOLID:
 * - Single Responsibility: Maneja solo la lógica común de búsqueda
 * - Template Method: Define el algoritmo común
 * - Open/Closed: Permite personalizar el comportamiento mediante opciones
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de casos de uso
 * - Depende de Repository (Infrastructure) a través de abstracción
 * - El repositorio define los campos de búsqueda en getSearchFields()
 * 
 * @abstract
 * @example
 * class SearchStudentUseCase extends BaseSearchUseCase {
 *   constructor({ studentRepository, logger }) {
 *     super({
 *       repository: studentRepository,
 *       logger,
 *       moduleName: 'Estudiantes',
 *       resourceName: 'estudiante',
 *     });
 *   }
 * }
 */
export class BaseSearchUseCase {
  /**
   * @param {Object} params - Parámetros de configuración
   * @param {Object} params.repository - Repositorio a usar (debe tener método search(searchTerm, options))
   * @param {Object} params.logger - Logger para registro de eventos
   * @param {string} params.moduleName - Nombre del módulo para logs (ej: 'Estudiantes', 'Configuración')
   * @param {string} params.resourceName - Nombre del recurso en español (ej: 'estudiante', 'carrera')
   */
  constructor({ repository, logger, moduleName, resourceName }) {
    if (!repository) {
      throw new Error('repository es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    if (!moduleName) {
      throw new Error('moduleName es requerido');
    }
    if (!resourceName) {
      throw new Error('resourceName es requerido');
    }

    this.repository = repository;
    this.logger = logger;
    this.moduleName = moduleName;
    this.resourceName = resourceName;
  }

  /**
   * Formatea un resultado individual a formato plano
   * 
   * @param {Object} result - Resultado a formatear
   * @returns {Object} Resultado formateado
   */
  formatResult(result) {
    return result.toPlainObject ? result.toPlainObject() : result;
  }

  /**
   * Ejecuta el caso de uso de búsqueda
   * 
   * Template Method: Define el algoritmo común de:
   * 1. Normalizar término de búsqueda (trim)
   * 2. Logging inicial
   * 3. Ejecutar búsqueda en el repositorio con límite
   * 4. Procesar y formatear resultados
   * 5. Retornar resultado
   * 
   * NOTA: searchTerm y limit ya están validados por el validator en las rutas
   * 
   * @param {string} searchTerm - Término de búsqueda (ya validado por el validator)
   * @param {number} limit - Límite de resultados (opcional, default: 50)
   * @returns {Promise<Array>} Array de resultados formateados (vacío si no hay resultados)
   */
  async execute(searchTerm, limit = 50) {
    // Normalizar término de búsqueda (trim)
    const trimmedSearchTerm = searchTerm.trim();

    // Logging inicial
    this.logger.info(`[${this.moduleName}] Iniciando búsqueda de ${this.resourceName}`, {
      searchTerm: trimmedSearchTerm,
      limit,
    });

    try {
      // Ejecutar búsqueda en el repositorio
      // El repositorio usa getSearchFields() para definir los campos de búsqueda
      const results = await this.repository.search(trimmedSearchTerm, { limit });

      // Procesar resultados
      if (!results || results.length === 0) {
        this.logger.info(`[${this.moduleName}] No se encontraron ${this.resourceName}s`, {
          searchTerm: trimmedSearchTerm,
          limit,
        });
        return [];
      }

      // Retornar todos los resultados formateados
      this.logger.info(`[${this.moduleName}] ${this.resourceName}s encontrados`, {
        count: results.length,
        searchTerm: trimmedSearchTerm,
        limit,
      });

      return results.map((result) => this.formatResult(result));
    } catch (error) {
      // Manejo de errores
      this.logger.error(`[${this.moduleName}] Error al buscar ${this.resourceName}`, {
        error: error.message,
        stack: error.stack,
        searchTerm: trimmedSearchTerm,
        limit,
      });
      throw error;
    }
  }
}
