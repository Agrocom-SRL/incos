/**
 * Use Case Base para operaciones de listado
 *
 * Implementa el patrón Template Method para proporcionar funcionalidad común
 * a todos los casos de uso de listado (países, departamentos, idiomas, etc.)
 *
 * Responsabilidades:
 * - Construir filtros específicos a partir de query parameters
 * - Parsea y valida parámetros de paginación (page, limit)
 * - Ejecuta consulta al repositorio con filtros
 * - Convierte entidades a formato de presentación usando mapper
 * - Calcula total de páginas
 * - Registra logs durante la operación
 * - Retorna respuesta estandarizada
 *
 * NOTA: La validación de parámetros (page, limit, search) se realiza en las rutas
 * mediante el validator común (listValidator), por lo que este use case
 * asume que los parámetros ya están validados.
 *
 * Principios SOLID:
 * - Single Responsibility: Maneja solo la lógica común de listado
 * - Template Method: Define el algoritmo común
 * - Open/Closed: Permite personalizar el comportamiento mediante hook methods
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de casos de uso
 * - Depende de Repository (Infrastructure) a través de abstracción
 * - Depende de Mapper (Application) para conversión Domain → Presentation
 *
 * @abstract
 * @example
 * class ListPaisesUseCase extends BaseListUseCase {
 *   constructor({ countryRepository, logger }) {
 *     super({
 *       repository: countryRepository,
 *       logger,
 *       moduleName: 'Geográficos',
 *       resourceName: 'países',
 *       collectionFieldName: 'countries',
 *       dataFieldName: 'paises',
 *     });
 *   }
 *
 *   getMapper() {
 *     return CountryMapper;
 *   }
 * }
 */
export class BaseListUseCase {
    /**
     * @param {Object} params - Parámetros de configuración
     * @param {Object} params.repository - Repositorio a usar (debe tener método findAll(filters, page, limit))
     * @param {Object} params.logger - Logger para registro de eventos
     * @param {string} params.moduleName - Nombre del módulo para logs (ej: 'Geográficos', 'Referencia')
     * @param {string} params.resourceName - Nombre del recurso en español (ej: 'países', 'departamentos')
     * @param {string} params.collectionFieldName - Nombre del campo en la respuesta del repository (ej: 'countries', 'departments')
     * @param {string} params.dataFieldName - Nombre del campo en la respuesta final (ej: 'paises', 'departamentos')
     */
    constructor({ repository, logger, moduleName, resourceName, collectionFieldName, dataFieldName }) {
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
        if (!collectionFieldName) {
            throw new Error('collectionFieldName es requerido');
        }
        if (!dataFieldName) {
            throw new Error('dataFieldName es requerido');
        }

        this.repository = repository;
        this.logger = logger;
        this.moduleName = moduleName;
        this.resourceName = resourceName;
        this.collectionFieldName = collectionFieldName;
        this.dataFieldName = dataFieldName;
    }

    /**
     * Retorna el mapper a usar para convertir entidades a presentación
     *
     * Método abstracto: Debe ser implementado por subclases
     *
     * @abstract
     * @returns {Object} Clase mapper con método estático entitiesToPresentation()
     */
    getMapper() {
        throw new Error('Method getMapper must be implemented by subclass');
    }

    /**
     * Construye filtros específicos adicionales a partir de los query parameters
     *
     * Hook method: Puede ser sobrescrito por subclases para construir filtros específicos
     * Similar a cómo BaseSearchUseCase normaliza searchTerm.trim()
     *
     * @param {Object} queryParams - Query parameters de Express (req.query)
     * @param {Object} baseFilters - Filtros base ya extraídos por ListRequestDTO (search, sort)
     * @returns {Object} Filtros combinados con filtros específicos normalizados
     */
    buildSpecificFilters(_queryParams = {}, baseFilters = {}) {
        // Implementación por defecto: retorna solo los filtros base
        // Las subclases pueden sobrescribir para agregar filtros específicos
        return baseFilters;
    }

    /**
     * Prepara y modifica filtros antes de ejecutar la consulta al repositorio
     *
     * Hook method: Opcional, puede ser sobrescrito por subclases para:
     * - Hacer consultas adicionales a otros repositorios
     * - Transformar filtros basados en resultados de consultas
     * - Modificar filtros antes de pasarlos al repositorio
     *
     * Similar a enrichData pero para filtros. Se ejecuta después de buildSpecificFilters
     * pero antes de llamar al repositorio.
     *
     * @param {Object} filters - Filtros ya construidos por buildSpecificFilters
     * @param {Object} queryParams - Query parameters originales (para consultas adicionales)
     * @returns {Promise<Object>|Object} Filtros modificados o los mismos si no hay cambios
     *
     * @example
     * // ListParalelosUseCase: Si viene periodo (número), buscar IDs de periodos
     * async prepareFilters(filters, queryParams) {
     *   if (queryParams.periodo) {
     *     const periodos = await this.periodRepository.findAll({ numero: queryParams.periodo });
     *     const periodoIds = periodos.map(p => p.id);
     *     return { ...filters, periodId: periodoIds };
     *   }
     *   return filters;
     * }
     */
    async prepareFilters(filters = {}, _queryParams = {}) {
        // Implementación por defecto: retorna los filtros sin modificar
        // Las subclases pueden sobrescribir para hacer consultas y modificar filtros
        return filters;
    }

    /**
     * Enriquece los datos después de la conversión a presentación
     *
     * Hook method: Opcional, puede ser sobrescrito por subclases para agregar
     * campos adicionales (conteos, datos relacionados, etc.)
     *
     * @param {Array} data - Array de objetos ya convertidos a formato de presentación
     * @param {Object} repositoryResult - Resultado completo del repository (incluye total, etc.)
     * @returns {Promise<Array>|Array} Array de datos enriquecidos
     */
    async enrichData(data, _repositoryResult) {
        // Implementación por defecto: retorna los datos sin modificar
        return data;
    }

    /**
     * Ejecuta el caso de uso de listado
     *
     * Template Method: Define el algoritmo común de:
     * 1. Construir filtros específicos (si buildSpecificFilters fue sobrescrito)
     * 2. Preparar filtros (si prepareFilters fue sobrescrito - permite consultas adicionales)
     * 3. Parsear y validar parámetros
     * 4. Logging inicial
     * 5. Ejecutar consulta al repositorio
     * 6. Convertir entidades a presentación (delegado a getMapper)
     * 7. Enriquecer datos (opcional, hook method)
     * 8. Calcular total de páginas
     * 9. Retornar respuesta estandarizada
     *
     * NOTA: baseFilters, page y limit ya están validados por el validator en las rutas
     *
     * @param {Object} baseFilters - Filtros base (search, sort) ya normalizados por ListRequestDTO
     * @param {number} page - Número de página (default: 1)
     * @param {number} limit - Límite de resultados por página (default: 50)
     * @param {Object} queryParams - Query parameters originales (opcional, para construir filtros específicos)
     * @returns {Promise<{dataFieldName: Array, total: number, page: number, limit: number, totalPages: number}>}
     */
    async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
        // 1. Construir filtros específicos si se proporcionan queryParams
        const initialFilters = Object.keys(queryParams).length > 0
            ? this.buildSpecificFilters(queryParams, baseFilters)
            : baseFilters;

        // 2. Preparar filtros (hook method - permite hacer consultas y modificar filtros)
        const filters = await this.prepareFilters(initialFilters, queryParams);

        // Parsear y validar parámetros
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 50;

        // Logging inicial
        this.logger.info(`[${this.moduleName}] Iniciando listado de ${this.resourceName}`, {
            filters,
            page: pageNum,
            limit: limitNum,
        });

        try {
            // Ejecutar consulta al repositorio
            const result = await this.repository.findAll(
                filters,
                pageNum,
                limitNum
            );

            // Convertir entidades a formato de presentación usando mapper
            const Mapper = this.getMapper();
            const data = Mapper.entitiesToPresentation(
                result[this.collectionFieldName] || []
            );

            // Enriquecer datos (hook method - opcional, puede ser sobrescrito por subclases)
            const enrichedData = await this.enrichData(data, result);

            // Calcular total de páginas
            const totalPages = Math.ceil(result.total / limitNum);

            // Logging final
            this.logger.info(`[${this.moduleName}] ${this.resourceName} listados exitosamente`, {
                total: result.total,
                page: pageNum,
                limit: limitNum,
                totalPages,
                count: enrichedData.length,
            });

            // Retornar respuesta estandarizada
            return {
                [this.dataFieldName]: enrichedData,
                total: result.total,
                page: pageNum,
                limit: limitNum,
                totalPages,
            };
        } catch (error) {
            // Manejo de errores
            this.logger.error(`[${this.moduleName}] Error al listar ${this.resourceName}`, {
                error: error.message,
                stack: error.stack,
                filters,
                page: pageNum,
                limit: limitNum,
            });
            throw error;
        }
    }
}
