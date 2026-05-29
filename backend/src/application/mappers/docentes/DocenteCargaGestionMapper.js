import {
  DEFAULT_MAX_HORAS_MES_DOCENTE,
  DEFAULT_MAX_HORAS_SEMANA_DOCENTE,
  SEMANAS_EQUIVALENTES_MES_CARGA_DOCENTE,
} from '../../../domain/constants/docentes.constants.js';

/**
 * Presentación de carga horaria del docente en una gestión (GET carga-gestion).
 */
export class DocenteCargaGestionMapper {
  /**
   * @param {Object} params
   * @param {number} params.docenteId
   * @param {number} params.gestionId
   * @param {number} [params.maxHorasSemana]
   * @param {number} [params.maxHorasMes]
   * @param {Array<{ id: number, ofertaCursoId: number, asignatura: string, paralelo: string, horas: number }>} params.asignaciones
   */
  static toPresentation({ docenteId, gestionId, maxHorasSemana, maxHorasMes, asignaciones = [] }) {
    const maxSemana = maxHorasSemana ?? DEFAULT_MAX_HORAS_SEMANA_DOCENTE;
    const maxMes = maxHorasMes ?? DEFAULT_MAX_HORAS_MES_DOCENTE;

    const cargaActualSemana = asignaciones.reduce((sum, row) => sum + (Number(row.horas) || 0), 0);
    const cargaActualMes = cargaActualSemana * SEMANAS_EQUIVALENTES_MES_CARGA_DOCENTE;

    const disponibleSemana = Math.max(0, maxSemana - cargaActualSemana);
    const disponibleMes = Math.max(0, maxMes - cargaActualMes);
    const sobrecarga = cargaActualSemana > maxSemana || cargaActualMes > maxMes;

    return {
      docente_id: docenteId,
      gestion_id: gestionId,
      max_horas_semana: maxSemana,
      max_horas_mes: maxMes,
      carga_actual_semana: cargaActualSemana,
      carga_actual_mes: cargaActualMes,
      disponible_semana: disponibleSemana,
      disponible_mes: disponibleMes,
      sobrecarga,
      asignaciones: asignaciones.map((row) => ({
        id: row.id,
        oferta_curso_id: row.ofertaCursoId,
        asignatura: row.asignatura,
        paralelo: row.paralelo,
        horas: row.horas,
      })),
    };
  }
}
