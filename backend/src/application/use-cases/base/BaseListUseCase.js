/**
 * Use Case Base para operaciones de listado
 * 
 * Implementa el patrón Template Method para proporcionar funcionalidad común
 * a todos los casos de uso de listado (países, departamentos, idiomas, etc.)
 * 
 * Responsabilidades:
 * - Parsea y valida parámetros de paginación (page, limit)
 * - Ejecuta consulta al repositorio con filtros
 * - Convierte entidades a formato de presentación usando mapper
 * - Calcula total de páginas
 * - Registra logs antes y después de la operación
 * - Retorna respuesta estandarizada
 * 
 * Principios SOLID:
 * - Single Responsibility: Maneja solo la lógica común de listado
 * - Template Method: Define el algoritmo común, delega conversión a mapper a subclases
 * - Open/Closed: Abierto para extensión (mappers específicos), cerrado para modificación
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
   * Enriquece los datos después de la conversión a presentación
   * 
   * Hook method: Opcional, puede ser sobrescrito por subclases para agregar
   * cualquier cantidad de campos adicionales a cada registro (conteos, datos relacionados, etc.)
   * 
   * Este método se ejecuta después de la conversión a presentación pero antes
   * de retornar la respuesta. Permite agregar campos calculados o relacionados
   * sin modificar el mapper base.
   * 
   * IMPORTANTE: Este método es completamente flexible y soporta:
   * - Agregar campos calculados (conteos, totales, promedios)
   * - Agregar datos completos de otras tablas/entidades (objetos relacionados)
   * - Agregar campos específicos extraídos de entidades relacionadas
   * - Combinar múltiples tipos de datos en un solo objeto
   * - Cualquier cantidad de campos que necesites
   * 
   * @param {Array} data - Array de objetos ya convertidos a formato de presentación
   * @param {Object} repositoryResult - Resultado completo del repository (incluye total, etc.)
   * @returns {Promise<Array>|Array} Array de datos enriquecidos (puede tener cualquier cantidad de campos adicionales)
   * 
   * @example
   * // Ejemplo 1: Agregar un solo campo calculado (conteo)
   * async enrichData(data, repositoryResult) {
   *   const enriched = await Promise.all(data.map(async (item) => {
   *     const count = await this.relatedRepository.count({ parentId: item.id });
   *     return { ...item, cantidadRelacionados: count };
   *   }));
   *   return enriched;
   * }
   * 
   * @example
   * // Ejemplo 2: Agregar múltiples campos calculados
   * async enrichData(data, repositoryResult) {
   *   const enriched = await Promise.all(data.map(async (depto) => {
   *     const [cantidadProvincias, cantidadMunicipios] = await Promise.all([
   *       this.provinceRepository.count({ departmentId: depto.id }),
   *       this.municipalityRepository.count({ departmentId: depto.id }),
   *     ]);
   *     return {
   *       ...depto,
   *       cantidadProvincias,
   *       cantidadMunicipios,
   *     };
   *   }));
   *   return enriched;
   * }
   * 
   * @example
   * // Ejemplo 3: Agregar datos completos de otras tablas (vistas/join)
   * // ListProvinciasUseCase: Agregar nombre del departamento y país
   * async enrichData(data, repositoryResult) {
   *   const enriched = await Promise.all(data.map(async (provincia) => {
   *     // Obtener entidades relacionadas
   *     const departamento = await this.departmentRepository.findById(provincia.departamentoId);
   *     const pais = departamento ? await this.countryRepository.findById(departamento.countryId) : null;
   *     
   *     // Agregar datos completos de otras tablas
   *     return {
   *       ...provincia,
   *       departamento: departamento ? {
   *         id: departamento.id,
   *         nombre: departamento.name, // Ya convertido a presentación por el mapper
   *       } : null,
   *       pais: pais ? {
   *         id: pais.id,
   *         nombre: pais.name,
   *         codigoIso: pais.isoCode,
   *       } : null,
   *     };
   *   }));
   *   return enriched;
   * }
   * 
   * @example
   * // Ejemplo 4: Combinar conteos + datos relacionados (caso más complejo)
   * async enrichData(data, repositoryResult) {
   *   const enriched = await Promise.all(data.map(async (provincia) => {
   *     const [departamento, cantidadMunicipios] = await Promise.all([
   *       this.departmentRepository.findById(provincia.departamentoId),
   *       this.municipalityRepository.count({ provinceId: provincia.id }),
   *     ]);
   *     
   *     const pais = departamento ? await this.countryRepository.findById(departamento.countryId) : null;
   *     
   *     return {
   *       ...provincia,
   *       // Datos relacionados
   *       departamento: departamento ? { id: departamento.id, nombre: departamento.name } : null,
   *       pais: pais ? { id: pais.id, nombre: pais.name } : null,
   *       // Campos calculados
   *       cantidadMunicipios,
   *       // Campos derivados
   *       rutaCompleta: `${pais?.name || ''} > ${departamento?.name || ''} > ${provincia.nombre}`,
   *     };
   *   }));
   *   return enriched;
   * }
   */
  async enrichData(data, repositoryResult) {
    // Implementación por defecto: retorna los datos sin modificar
    // Las subclases pueden sobrescribir este método para agregar CUALQUIER
    // cantidad de campos adicionales que necesiten
    return data;
  }

  /**
   * Ejecuta el caso de uso de listado
   * 
   * Template Method: Define el algoritmo común de:
   * 1. Parsear y validar parámetros
   * 2. Logging inicial
   * 3. Ejecutar consulta al repositorio
   * 4. Convertir entidades a presentación (delegado a getMapper)
   * 5. Calcular total de páginas
   * 6. Logging final
   * 7. Retornar respuesta estandarizada
   * 
   * @param {Object} filters - Filtros de búsqueda
   * @param {number} page - Número de página (default: 1)
   * @param {number} limit - Límite de resultados por página (default: 50)
   * @returns {Promise<{dataFieldName: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(filters = {}, page = 1, limit = 50) {
    // 1. Parsear y validar parámetros
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;

    // 2. Logging inicial
    this.logger.info(`[${this.moduleName}] Listando ${this.resourceName}`, {
      filters,
      page: pageNum,
      limit: limitNum,
    });

    // 3. Ejecutar consulta al repositorio
    const result = await this.repository.findAll(
      filters,
      pageNum,
      limitNum
    );

    // 4. Convertir entidades a formato de presentación usando mapper
    const Mapper = this.getMapper();
    const data = Mapper.entitiesToPresentation(
      result[this.collectionFieldName] || []
    );

    // 4.5. Enriquecer datos (hook method - opcional, puede ser sobrescrito por subclases)
    const enrichedData = await this.enrichData(data, result);

    // 5. Calcular total de páginas
    const totalPages = Math.ceil(result.total / limitNum);

    // 6. Logging final
    this.logger.info(`[${this.moduleName}] ${this.resourceName} listados exitosamente`, {
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      count: enrichedData.length,
    });

    // 7. Retornar respuesta estandarizada
    return {
      [this.dataFieldName]: enrichedData,
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}

