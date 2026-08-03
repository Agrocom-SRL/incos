/**
 * Interfaz del Repositorio de Alertas de Riesgo Pedagógico (módulo TUT ·
 * Acompañamiento). Fuente: vista 156 (riesgo calculado, NO tabla) — arquetipo B
 * (solo lectura): NO extiende IBaseRepository.
 *
 * Contrato A1-A3 de docs/plan/tutorias-plan-desarrollo.md.
 *
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 */

export class IAlertaRiesgoRepository {
  /**
   * Alertas de riesgo de la gestión (A1, `alertasRiesgo`).
   * @param {Object} _options - { params: { gestionId?, carreraId?, materiaId? } }
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerAlertas(_options = {}) {
    throw new Error('Método obtenerAlertas debe ser implementado');
  }

  /**
   * Alumnos en riesgo de los cursos del docente autenticado (A2,
   * `misAlumnosEnRiesgo`). El backend resuelve el docente por token.
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerMisAlumnos() {
    throw new Error('Método obtenerMisAlumnos debe ser implementado');
  }

  /**
   * Detalle de riesgo de un estudiante — todas sus materias (A3,
   * `alertaEstudiante`).
   * @param {string|number} _estudianteId
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerAlertaEstudiante(_estudianteId) {
    throw new Error('Método obtenerAlertaEstudiante debe ser implementado');
  }
}
