/**
 * GET /api/v1/estudiantes/becas
 * Controller para listar todas las becas asignadas a estudiantes
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para listar becas asignadas
 * - Extraer filtros y parámetros de paginación de query params
 * - Delegar lógica de negocio a ListStudentScholarshipsUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * GET /api/v1/estudiantes/becas?page=1&limit=50&search=Juan&studentId=1&state=ACTIVA
 * 
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 50)
 * - search: Término de búsqueda (busca en nombre estudiante, CI, código, nombre beca, gestión)
 * - studentId: Filtrar por ID de estudiante (opcional)
 * - managementId: Filtrar por ID de gestión (opcional)
 * - state: Filtrar por estado (PENDIENTE, ACTIVA, RECHAZADA, etc.) (opcional)
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para listar becas asignadas
 * - Dependency Inversion: Depende de ListStudentScholarshipsUseCase (abstracción)
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases) a través de inyección de dependencias
 */

import { BaseListController } from '../../base/BaseListController.js';

export class ListStudentScholarshipsController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListStudentScholarshipsUseCase} params.listStudentScholarshipsUseCase - Caso de uso para listar becas asignadas
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listStudentScholarshipsUseCase, logger, responseFormatter }) {
    super({
      useCase: listStudentScholarshipsUseCase,
      logger,
      responseFormatter,
      resourceName: 'becas asignadas',
      dataFieldName: 'becas',
    });
  }

  /**
   * Construye filtros específicos a partir de query parameters
   * Sobrescribe el método de BaseListController para agregar filtros específicos
   * 
   * @param {Object} query - Query parameters de Express
   * @param {Object} baseFilters - Filtros base (search, sort)
   * @returns {Object} Filtros combinados
   */
  buildFilters(query, baseFilters = {}) {
    const filters = { ...baseFilters };

    // Filtro por ID de estudiante
    if (query.studentId) {
      const studentId = parseInt(query.studentId, 10);
      if (!isNaN(studentId)) {
        filters.studentId = studentId;
      }
    }

    // Filtro por ID de gestión
    if (query.managementId) {
      const managementId = parseInt(query.managementId, 10);
      if (!isNaN(managementId)) {
        filters.managementId = managementId;
      }
    }

    // Filtro por estado
    if (query.state) {
      filters.state = query.state;
    }

    // Filtro por ID de beca/descuento
    if (query.scholarshipId) {
      const scholarshipId = parseInt(query.scholarshipId, 10);
      if (!isNaN(scholarshipId)) {
        filters.scholarshipId = scholarshipId;
      }
    }

    return filters;
  }
}
