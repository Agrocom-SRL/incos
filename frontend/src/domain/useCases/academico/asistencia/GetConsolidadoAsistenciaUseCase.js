/**
 * Consolidado % de asistencia del paralelo (página Consolidado de ACA-ASI):
 * matriz estudiantes × asignaturas con % por curso y promedio ponderado.
 * Sin `bimestre` el backend devuelve el acumulado anual.
 */

export class GetConsolidadoAsistenciaUseCase {
  /**
   * @param {import('@infrastructure/repositories/AsistenciaRepository.js').default} asistenciaRepository
   */
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  /**
   * @param {Object} params
   * @param {number} params.paraleloGestionId
   * @param {number|null} [params.bimestre] - 1..4; null = acumulado anual.
   */
  async ejecutar({ paraleloGestionId, bimestre = null } = {}) {
    return this.asistenciaRepository.obtenerConsolidado({ paraleloGestionId, bimestre });
  }
}
