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
import { resolveEstudianteIdForUsuario } from '../../../../application/utils/resolveEstudianteIdForUsuario.js';

export class ListStudentScholarshipsController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListStudentScholarshipsUseCase} params.listStudentScholarshipsUseCase - Caso de uso para listar becas asignadas
   * @param {Object} params.studentRepository - Repositorio de estudiantes (resuelve el estudiante de la sesión)
   * @param {Object} params.userRepository - Repositorio de usuarios (fallback por referencia polimórfica)
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({
    listStudentScholarshipsUseCase,
    studentRepository,
    userRepository,
    logger,
    responseFormatter,
  }) {
    super({
      useCase: listStudentScholarshipsUseCase,
      logger,
      responseFormatter,
      resourceName: 'becas asignadas',
      dataFieldName: 'becas',
    });
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
  }

  /**
   * Portal del estudiante ("Mi beca"): reutiliza esta MISMA ruta/listado admin
   * (GET /estudiantes/becas) vía la opción de menú "Becas" (matricula.beca.ver,
   * labelByRole en el frontend). Cuando el rol de la sesión es ESTUDIANTE, el
   * studentId SIEMPRE se resuelve en servidor desde el usuario autenticado y se
   * sobrescribe cualquier `studentId` que llegue por query params del cliente
   * (anti-IDOR): así un estudiante nunca puede pedir el listado de becas de
   * OTRO estudiante ni el listado completo. Mismo criterio que MisAportesController.
   * Si el usuario no tiene vínculo de estudiante, resolveEstudianteIdForUsuario
   * lanza ForbiddenError (403).
   *
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware de Express
   */
  async handle(req, res, next) {
    try {
      if (req.usuario?.rolCodigo === 'ESTUDIANTE') {
        const estudianteId = await resolveEstudianteIdForUsuario({
          studentRepository: this.studentRepository,
          userRepository: this.userRepository,
          usuarioId: req.usuario.id,
        });
        req.query = { ...req.query, studentId: String(estudianteId) };
      }
    } catch (error) {
      this.logger.error(`Error al resolver el alcance de ${this.resourceName} para el estudiante`, {
        error: error.message,
      });
      return next(error);
    }

    return super.handle(req, res, next);
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
      if (!Number.isNaN(Number(studentId))) {
        filters.studentId = studentId;
      }
    }

    // Filtro por ID de gestión
    if (query.managementId) {
      const managementId = parseInt(query.managementId, 10);
      if (!Number.isNaN(Number(managementId))) {
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
      if (!Number.isNaN(Number(scholarshipId))) {
        filters.scholarshipId = scholarshipId;
      }
    }

    return filters;
  }
}
