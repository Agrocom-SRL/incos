/**
 * Use Case: Obtener contexto de matrícula (wizard de inscripción)
 *
 * Single Responsibility: Orquestar la carga del contexto de matrícula de un
 * estudiante (GET /v1/inscripciones/contexto-matricula).
 * Dependency Inversion: Depende de la abstracción IInscripcionRepository.
 *
 * El backend responde `data.contexto` (dataFieldName 'contexto') con:
 * estudiante, gestion, carrera, planes habilitados, plan resuelto,
 * periodos con asignaturas (+ prerrequisito y estadoHistorial) y resumenHistorial.
 * Este use case retorna el objeto `contexto` ya desanidado para que el hook
 * lo consuma directo (dataKey 'contexto' == dataFieldName del backend).
 */

export class ObtenerContextoMatriculaUseCase {
  /**
   * @param {import('@repositories/IInscripcionRepository').IInscripcionRepository} inscripcionRepository
   */
  constructor(inscripcionRepository) {
    this.inscripcionRepository = inscripcionRepository;
  }

  /**
   * @param {Object} params
   * @param {string|number} params.estudianteId - ID del estudiante (requerido)
   * @param {string|number} [params.carreraId] - Requerido solo si el estudiante no tiene carrera fija
   * @param {string|number} [params.planEstudioId] - Plan solicitado (opcional)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async ejecutar(params = {}) {
    try {
      if (!params?.estudianteId) {
        return { success: false, error: 'ID del estudiante es requerido' };
      }

      const result = await this.inscripcionRepository.obtenerContextoMatricula(params);
      if (!result.success) {
        return result;
      }

      return {
        success: true,
        data: result.data?.contexto ?? null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al cargar el contexto de matrícula',
      };
    }
  }
}
