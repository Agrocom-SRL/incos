/**
 * Use Case: ListParalelosUseCase
 * Módulo: Académico
 * Lista paralelos con filtros, paginación y ordenamiento
 * 
 * Filtros específicos: periodo (número), periodo_id (ID), carrera_id
 * 
 * Si se proporciona periodo (número), busca todos los periodos con ese número
 * y luego filtra paralelos por los IDs obtenidos (devuelve paralelos de todas las carreras)
 * 
 * Enriquece los paralelos con estadísticas de inscripciones:
 * - Total de estudiantes inscritos
 * - Total por género (hombres y mujeres)
 */
import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { ParallelMapper } from '../../mappers/academico/index.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';

export class ListParalelosUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.parallelRepository - Repositorio de paralelos
   * @param {Object} params.periodRepository - Repositorio de periodos
   * @param {Object} params.configuracionSistemaRepository - Repositorio de configuración del sistema
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ 
    parallelRepository, 
    periodRepository, 
    configuracionSistemaRepository,
    managementRepository,
    logger 
  }) {
    super({
      repository: parallelRepository,
      logger,
      moduleName: 'Académico',
      resourceName: 'paralelos',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'parallels',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'paralelos',
    });
    this.periodRepository = periodRepository;
    this.configuracionSistemaRepository = configuracionSistemaRepository;
    this.managementRepository = managementRepository;
  }

  /**
   * Retorna el mapper a usar para convertir entidades Parallel a presentación
   * @returns {ParallelMapper}
   */
  getMapper() {
    return ParallelMapper;
  }

  /**
   * Construye filtros específicos adicionales a partir de los query parameters
   * @param {Object} queryParams - Query parameters de Express (req.query)
   * @param {Object} baseFilters - Filtros base ya extraídos por ListRequestDTO (search, sort)
   * @returns {Object} Filtros combinados con filtros específicos normalizados
   */
  buildSpecificFilters(queryParams = {}, baseFilters = {}) {
    const filters = { ...baseFilters };

    // periodo_id: filtro directo por ID único
    if (queryParams.periodo_id) {
      filters.periodId = parseInt(queryParams.periodo_id);
    }

    // periodo: se maneja en execute() para obtener IDs de todas las carreras
    // No se agrega aquí, se procesa antes de llamar al método base

    if (queryParams.carrera_id) {
      filters.careerId = parseInt(queryParams.carrera_id);
    }

    return filters;
  }

  /**
   * Prepara filtros cuando hay filtro por periodo (número)
   * 
   * Si viene periodo (número), busca todos los periodos con ese número,
   * obtiene sus IDs y modifica los filtros para usar esos IDs
   * 
   * @param {Object} filters - Filtros ya construidos por buildSpecificFilters
   * @param {Object} queryParams - Query parameters originales (para detectar periodo)
   * @returns {Promise<Object>} Filtros modificados con periodId como array de IDs
   */
  async prepareFilters(filters = {}, queryParams = {}) {
    // Si hay filtro por periodo (número), obtener IDs de periodos primero
    if (queryParams.periodo) {
      const periodoNumero = parseInt(queryParams.periodo);

      // Obtener solo los IDs de periodos con ese número (de todas las carreras)
      const periodosResult = await this.periodRepository.findAll(
        {
          number: periodoNumero,
          attributes: ['id'], // Solo traer IDs, sin mapear
        },
        null, // sin paginación
        null
      );

      const periodoIds = (periodosResult.periods || []).map((p) => p.id);

      // Si no hay periodos, retornar filtro que no coincida con nada
      if (periodoIds.length === 0) {
        return { ...filters, periodId: [] };
      }

      // Modificar filtros con los IDs obtenidos
      // Sequelize automáticamente convierte arrays a IN (1, 2, 3)
      return { ...filters, periodId: periodoIds };
    }

    return filters;
  }

  /**
   * Enriquece los paralelos con estadísticas de inscripciones
   * Agrega: totalInscritos, totalHombres, totalMujeres
   * 
   * @param {Array} data - Array de paralelos ya convertidos a formato de presentación
   * @param {Object} repositoryResult - Resultado completo del repository
   * @returns {Promise<Array>} Array de paralelos enriquecidos con estadísticas
   */
  async enrichData(data, repositoryResult) {
    if (!data || data.length === 0) {
      return data;
    }

    try {
      // Obtener gestión actual
      const gestionConfig = await this.configuracionSistemaRepository.findBy(
        { key: 'gestion_actual' }
      );

      if (!gestionConfig || !gestionConfig.value) {
        this.logger.warn('[Académico] No se encontró gestión actual, no se pueden calcular estadísticas');
        return data.map(paralelo => ({
          ...paralelo,
          estadisticas: {
            totalInscritos: 0,
            totalHombres: 0,
            totalMujeres: 0,
          },
        }));
      }

      const gestionYear = parseInt(gestionConfig.value, 10);
      const management = await this.managementRepository.findBy({
        year: gestionYear,
        vigente: true,
      });

      if (!management) {
        this.logger.warn('[Académico] No se encontró gestión vigente, no se pueden calcular estadísticas');
        return data.map(paralelo => ({
          ...paralelo,
          estadisticas: {
            totalInscritos: 0,
            totalHombres: 0,
            totalMujeres: 0,
          },
        }));
      }

      // Obtener IDs de paralelos
      const parallelIds = data.map(p => p.id).filter(id => id != null);

      if (parallelIds.length === 0) {
        return data;
      }

      // Usar vista SQL reutilizable para obtener estadísticas
      // La vista vista_estadisticas_paralelos_por_gestion ya tiene toda la lógica de JOINs
      // y reutiliza las vistas base modulares (vista_base_paralelos_info, vista_base_cursos_paralelos, etc.)
      // 
      // NOTA: La vista agrupa por gestion_id, por lo que paralelos sin inscripciones tendrán gestion_id = NULL
      // Usamos LEFT JOIN para incluir todos los paralelos, incluso sin inscripciones
      // También incluimos el número del periodo para mostrarlo en el resumen
      const parallelIdsPlaceholder = parallelIds.map(() => '?').join(',');
      const query = `
        SELECT 
          p.id AS paralelo_id,
          COALESCE(v.gestion_id, ?) AS gestion_id,
          COALESCE(v.total_inscritos, 0) AS total_inscritos,
          COALESCE(v.total_hombres, 0) AS total_hombres,
          COALESCE(v.total_mujeres, 0) AS total_mujeres,
          per.numero AS periodo_numero
        FROM paralelos p
        LEFT JOIN vista_estadisticas_paralelos_por_gestion v 
          ON v.paralelo_id = p.id 
          AND v.gestion_id = ?
        LEFT JOIN periodos per ON per.id = p.periodo_id
          AND per.activo = TRUE 
          AND per.deleted_at IS NULL
        WHERE p.id IN (${parallelIdsPlaceholder})
          AND p.activo = TRUE 
          AND p.deleted_at IS NULL
      `;

      const results = await sequelize.query(query, {
        replacements: [management.id, management.id, ...parallelIds],
        type: sequelize.QueryTypes.SELECT,
      });

      // Log de depuración (solo en desarrollo)
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug('[Académico] Estadísticas de paralelos calculadas', {
          parallelIds,
          managementId: management.id,
          managementYear: management.year,
          resultsCount: results?.length || 0,
          results: results,
        });
        
        // Log adicional para diagnosticar si no hay resultados
        if (!results || results.length === 0) {
          // Consulta de diagnóstico usando la vista
          try {
            const diagnosticQuery = `
              SELECT 
                COUNT(DISTINCT paralelo_id) AS paralelos_con_datos,
                SUM(total_inscritos) AS total_inscritos_vista,
                SUM(total_hombres) AS total_hombres_vista,
                SUM(total_mujeres) AS total_mujeres_vista
              FROM vista_estadisticas_paralelos_por_gestion
              WHERE gestion_id = ?
                AND paralelo_id IN (${parallelIdsPlaceholder})
            `;
            
            const diagnosticResult = await sequelize.query(diagnosticQuery, {
              replacements: [management.id, ...parallelIds],
              type: sequelize.QueryTypes.SELECT,
            });
            
            this.logger.warn('[Académico] Diagnóstico de datos relacionados', {
              parallelIds,
              managementId: management.id,
              diagnosticData: diagnosticResult[0] || {},
              suggestion: 'Verificar que existan: cursos activos, asignaciones docentes vigentes, inscripciones_materias, e inscripciones en la gestión actual',
            });
          } catch (diagError) {
            this.logger.error('[Académico] Error en consulta de diagnóstico', {
              error: diagError.message,
              stack: diagError.stack,
            });
          }
        }
      }

      // Crear mapa de estadísticas por paralelo
      // MySQL puede retornar valores como strings, BigInt, o Decimal
      // Convertimos a número entero de forma segura
      const statsMap = {};
      if (Array.isArray(results) && results.length > 0) {
        results.forEach(row => {
          if (row.paralelo_id) {
            // Función helper para convertir a número entero de forma segura
            const toInt = (value) => {
              if (value === null || value === undefined) return 0;
              // Si es BigInt, convertir a Number
              if (typeof value === 'bigint') return Number(value);
              // Si es string, parsear
              if (typeof value === 'string') {
                const parsed = parseInt(value, 10);
                return isNaN(parsed) ? 0 : parsed;
              }
              // Si ya es número, redondear a entero
              return Math.floor(Number(value)) || 0;
            };

            statsMap[row.paralelo_id] = {
              totalInscritos: toInt(row.total_inscritos),
              totalHombres: toInt(row.total_hombres),
              totalMujeres: toInt(row.total_mujeres),
            };
          }
        });
      }

      // Log del mapa de estadísticas creado
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug('[Académico] Mapa de estadísticas creado', {
          statsMap,
          paralelosCount: data.length,
        });
      }

      // Crear mapa de números de periodo por paralelo
      const periodoNumeroMap = {};
      if (Array.isArray(results) && results.length > 0) {
        results.forEach(row => {
          if (row.paralelo_id && row.periodo_numero !== null && row.periodo_numero !== undefined) {
            periodoNumeroMap[row.paralelo_id] = parseInt(row.periodo_numero || 0, 10);
          }
        });
      }

      // Enriquecer cada paralelo con sus estadísticas y número de periodo
      const enrichedData = data.map(paralelo => {
        const estadisticas = statsMap[paralelo.id] || {
          totalInscritos: 0,
          totalHombres: 0,
          totalMujeres: 0,
        };
        
        // Agregar número de periodo si está disponible
        const periodoNumero = periodoNumeroMap[paralelo.id];
        
        return {
          ...paralelo,
          estadisticas,
          ...(periodoNumero && { periodoNumero }),
        };
      });

      // Log final de datos enriquecidos (solo primeros 2 para no saturar)
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug('[Académico] Datos enriquecidos con estadísticas', {
          sample: enrichedData.slice(0, 2).map(p => ({
            id: p.id,
            nombre: p.nombre,
            estadisticas: p.estadisticas,
          })),
          totalEnriched: enrichedData.length,
        });
      }

      return enrichedData;
    } catch (error) {
      this.logger.error('[Académico] Error al enriquecer paralelos con estadísticas', {
        error: error.message,
        stack: error.stack,
      });
      // Si falla, retornar datos sin estadísticas (con valores por defecto)
      return data.map(paralelo => ({
        ...paralelo,
        estadisticas: {
          totalInscritos: 0,
          totalHombres: 0,
          totalMujeres: 0,
        },
      }));
    }
  }
}
