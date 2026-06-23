import {
  ESTADOS_ASISTENCIA,
  MARCAS_PLANILLA,
  MOTIVOS_NEUTRO,
} from '../../../domain/constants/asistencia.constants.js';

/**
 * Mapper de presentación de la planilla de asistencia. Deriva la marca P/R/F/L y la
 * neutralidad a partir de los insumos crudos (estado persistido + licencia + neutros
 * del día). Vocabulario del docente (P/R/F/L), persistencia en PRESENTE/AUSENTE/TARDANZA.
 *
 * Jerarquía (schema 17 §3.4):
 *   1. neutro del día (FERIADO / CLASE_NO_DICTADA) → marca neutra, no cuenta al %.
 *   2. licencia APROBADA del estudiante → 'L' (neutro LICENCIA).
 *   3. estado persistido: AUSENTE → 'F', TARDANZA → 'R'.
 *   4. sesión existente sin fila → PRESENTE implícito → 'P'.
 */
export const PlanillaAsistenciaPresentationMapper = {
  /**
   * Deriva la marca de una celda.
   *
   * @param {Object} celda
   * @param {string|null} celda.estado estado persistido (AUSENTE/TARDANZA) o null
   * @param {boolean} celda.tieneLicencia licencia APROBADA cubre la fecha
   * @param {string|null} celda.neutroDia motivo neutro del día (FERIADO/CLASE_NO_DICTADA) o null
   * @returns {{ marca: string|null, neutro: string|null }}
   */
  derivarMarca({ estado, tieneLicencia = false, neutroDia = null }) {
    // 1. Día neutro institucional (no depende del estudiante).
    if (neutroDia) {
      return { marca: null, neutro: neutroDia };
    }
    // 2. Licencia aprobada del estudiante.
    if (tieneLicencia) {
      return { marca: MARCAS_PLANILLA.LICENCIA, neutro: MOTIVOS_NEUTRO.LICENCIA };
    }
    // 3. Estado persistido.
    if (estado === ESTADOS_ASISTENCIA.AUSENTE) {
      return { marca: MARCAS_PLANILLA.AUSENTE, neutro: null };
    }
    if (estado === ESTADOS_ASISTENCIA.TARDANZA) {
      return { marca: MARCAS_PLANILLA.TARDANZA, neutro: null };
    }
    // 4. PRESENTE implícito (sesión existente, sin fila).
    return { marca: MARCAS_PLANILLA.PRESENTE, neutro: null };
  },
};

export default PlanillaAsistenciaPresentationMapper;
