/**
 * Use Case: ListStudentScholarshipsUseCase
 * Módulo: Estudiantes
 * Lista todas las becas asignadas a estudiantes con datos enriquecidos
 *
 * Responsabilidades:
 * - Obtener las becas asignadas desde vista_beca_asignada_listado en UNA sola
 *   lectura (elimina el N+1 previo que resolvía estudiante/beca/gestión fila a
 *   fila con findById).
 * - Aplicar filtros (studentId, managementId, state), búsqueda y paginación en BD.
 * - Retornar lista enriquecida (estudiante, beca, gestión, carrera e impacto).
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja el listado de becas asignadas.
 * - Dependency Inversion: Depende de abstracciones (repositorio).
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio.
 * - Depende del Repository (Infrastructure) a través de abstracción.
 */

export class ListStudentScholarshipsUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.studentScholarshipRepository - Repositorio de asignaciones de becas
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({ studentScholarshipRepository, logger }) {
    this.studentScholarshipRepository = studentScholarshipRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso de listado de becas asignadas
   *
   * @param {Object} filters - Filtros base (search, etc.)
   * @param {number} page - Número de página (default: 1)
   * @param {number} limit - Límite por página (default: 50)
   * @param {Object} queryParams - Query parameters originales (filtros específicos)
   * @returns {Promise<Object>} Lista de becas asignadas con datos enriquecidos
   */
  async execute(filters = {}, page = 1, limit = 50, queryParams = {}) {
    this.logger.info('[Estudiantes] Iniciando listado de becas asignadas', {
      filters,
      page,
      limit,
    });

    try {
      // 1. Resolver filtros específicos (queryParams tiene prioridad sobre filters)
      const studentId = this._parseId(queryParams.studentId ?? filters.studentId);
      const managementId = this._parseId(queryParams.managementId ?? filters.managementId);
      const state = queryParams.state ?? filters.state ?? undefined;
      const search = queryParams.search ?? filters.search ?? undefined;

      const safePage = parseInt(page, 10) || 1;
      const safeLimit = parseInt(limit, 10) || 50;

      // 2. Lectura única de la vista (arquetipo B, solo lectura)
      const { rows, total } = await this.studentScholarshipRepository.listarBecasAsignadas({
        studentId,
        managementId,
        state,
        search,
        page: safePage,
        limit: safeLimit,
      });

      // 3. Mapear filas planas de la vista al shape del listado
      const becas = rows.map((row) => this._mapRow(row));

      const totalPages = Math.ceil(total / safeLimit) || 0;

      const result = {
        becas,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
      };

      this.logger.info('[Estudiantes] Becas asignadas listadas exitosamente', {
        count: becas.length,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
      });

      return result;
    } catch (error) {
      this.logger.error('[Estudiantes] Error al listar becas asignadas', {
        error: error.message,
        stack: error.stack,
        filters,
        page,
        limit,
      });
      throw error;
    }
  }

  /**
   * Normaliza un id numérico opcional.
   * @param {*} value
   * @returns {number|undefined}
   */
  _parseId(value) {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  /**
   * Convierte un número opcional (montos) preservando null.
   * @param {*} value
   * @returns {number|null}
   */
  _toNumberOrNull(value) {
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  /**
   * Mapea una fila de vista_beca_asignada_listado al ítem del listado.
   * Mantiene el shape estable que consume el frontend y añade carrera + impacto.
   * @param {Object} row - Fila plana de la vista
   * @returns {Object}
   */
  _mapRow(row) {
    // Nombre completo: APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES
    const nombreCompleto = [row.apellido_paterno, row.apellido_materno, row.nombres]
      .filter((part) => part && `${part}`.trim() !== '')
      .join(' ')
      .trim() || null;

    const student = row.estudiante_id
      ? {
          id: row.estudiante_id,
          codigoEstudiante: row.codigo_estudiante ?? null,
          nombreCompleto,
          ci: row.ci ?? null,
          expedicion: row.expedicion ?? null,
        }
      : null;

    const scholarship = row.beca_descuento_id
      ? {
          id: row.beca_descuento_id,
          nombre: row.beca_nombre ?? null,
          codigo: row.beca_codigo ?? null,
          porcentaje: this._toNumberOrNull(row.beca_porcentaje),
          descripcion: row.beca_descripcion ?? null,
        }
      : null;

    const management = row.gestion_id
      ? {
          id: row.gestion_id,
          codigo: row.gestion_codigo ?? null,
          nombre: row.gestion_nombre ?? null,
          anio: row.gestion_anio ?? null,
        }
      : null;

    const carrera = row.carrera_nombre || row.carrera_codigo || row.carrera_color_hex
      ? {
          nombre: row.carrera_nombre ?? null,
          codigo: row.carrera_codigo ?? null,
          colorHex: row.carrera_color_hex ?? null,
        }
      : null;

    const descuentoAplicado = this._toNumberOrNull(row.descuento_aplicado);
    const montoObligatorio = this._toNumberOrNull(row.monto_obligatorio);
    const impacto = descuentoAplicado !== null || montoObligatorio !== null
      ? { descuentoAplicado, montoObligatorio }
      : null;

    return {
      id: row.id,
      studentId: row.estudiante_id,
      scholarshipId: row.beca_descuento_id,
      managementId: row.gestion_id,
      requestDate: row.fecha_solicitud,
      state: row.estado,
      documentsComplete: Boolean(row.documentos_completos),
      observations: row.observaciones ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      student,
      scholarship,
      management,
      carrera,
      impacto,
    };
  }
}
