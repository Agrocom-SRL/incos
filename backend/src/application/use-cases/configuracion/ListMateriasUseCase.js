/**
 * Use Case: ListMateriasUseCase
 * Módulo: Configuración
 * Lista materias con filtros, paginación y ordenamiento
 * 
 * Filtros específicos: periodo_id
 * 
 * Las materias se relacionan con periodos a través de asignatura_plan
 * Si se proporciona periodo_id, busca todas las asignaturas_plan con ese periodo_id,
 * obtiene los materia_id y filtra las materias por esos IDs
 */
import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { SubjectMapper } from '../../mappers/configuracion/index.js';

export class ListMateriasUseCase extends BaseListUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.subjectRepository - Repositorio de materias
   * @param {Object} params.planSubjectRepository - Repositorio de asignaturas_plan
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ subjectRepository, planSubjectRepository, logger }) {
    super({
      repository: subjectRepository,
      logger,
      moduleName: 'Configuración',
      resourceName: 'materias',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'subjects',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'materias',
    });
    this.planSubjectRepository = planSubjectRepository;
  }

  /**
   * Retorna el mapper a usar para convertir entidades Subject a presentación
   * @returns {SubjectMapper}
   */
  getMapper() {
    return SubjectMapper;
  }

  /**
   * Construye filtros específicos adicionales a partir de los query parameters
   * @param {Object} queryParams - Query parameters de Express (req.query)
   * @param {Object} baseFilters - Filtros base ya extraídos por ListRequestDTO (search, sort)
   * @returns {Object} Filtros combinados con filtros específicos normalizados
   */
  buildSpecificFilters(queryParams = {}, baseFilters = {}) {
    const filters = { ...baseFilters };

    // periodo_id: se maneja en prepareFilters() para obtener IDs de materias
    // No se agrega aquí, se procesa antes de llamar al método base

    return filters;
  }

  /**
   * Prepara filtros cuando hay filtro por periodo_id
   * 
   * Si viene periodo_id, busca todas las asignaturas_plan con ese periodo_id,
   * obtiene los materia_id y modifica los filtros para usar esos IDs
   * 
   * @param {Object} filters - Filtros ya construidos por buildSpecificFilters
   * @param {Object} queryParams - Query parameters originales (para detectar periodo_id)
   * @returns {Promise<Object>} Filtros modificados con subjectId como array de IDs
   */
  async prepareFilters(filters = {}, queryParams = {}) {
    // Si hay filtro por periodo_id, obtener IDs de materias primero
    if (queryParams.periodo_id) {
      const periodoId = parseInt(queryParams.periodo_id);

      // Obtener todas las asignaturas_plan con ese periodo_id
      // Usar el repositorio de la misma forma que ListParalelosUseCase usa periodRepository
      const asignaturasPlanResult = await this.planSubjectRepository.findAll(
        {
          periodId: periodoId,
          activo: true,
          attributes: ['materiaId'], // Solo traer materiaId
        },
        null, // sin paginación
        null
      );

      // Extraer los IDs de materias únicos
      // PlanSubjectMapper mapea materiaId (modelo) → subjectId (entidad)
      const planSubjects = asignaturasPlanResult.planSubjects || [];
      const materiaIds = [...new Set(
        planSubjects.map((ap) => ap.subjectId).filter(Boolean)
      )];

      // Si no hay materias, retornar filtro que no coincida con nada
      if (materiaIds.length === 0) {
        return { ...filters, id: [] };
      }

      // Modificar filtros con los IDs obtenidos
      // Sequelize automáticamente convierte arrays a IN (1, 2, 3)
      return { ...filters, id: materiaIds };
    }

    return filters;
  }
}

