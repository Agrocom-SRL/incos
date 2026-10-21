/**
 * Mapper de aplicación: GrupoCapacitacion (módulo CAP)
 *
 * Convierte filas de la vista 190 (`vista_grupos_capacitacion_listado`,
 * snake_case) y los horarios del grupo (vista 154) al formato de presentación
 * del listado de grupos. `cursoEstado` es el estado EFECTIVO del curso
 * (`resolveEstadoEfectivoCurso`), nunca el crudo de BD.
 */

import { resolveEstadoEfectivoCurso } from '../../use-cases/capacitacion/helpers/cursoEstadoEfectivo.js';

/**
 * Fila de la vista 190 + horarios del grupo → presentación.
 * @param {Object|null} row
 * @param {Array<{horarioId: number, etiqueta: string}>} [horarios]
 * @returns {Object|null}
 */
export function rowToPresentation(row, horarios = []) {
  if (!row) return null;

  return {
    grupoId: row.grupo_id,
    nombre: row.nombre,
    orden: row.orden ?? 1,
    cursoId: row.curso_id,
    cursoTitulo: row.curso_titulo,
    cursoEstado: resolveEstadoEfectivoCurso(
      row.curso_estado,
      row.curso_fecha_inicio,
      row.curso_fecha_fin
    ),
    modalidad: row.modalidad ?? null,
    cupoMaximo: row.cupo_maximo ?? null,
    inscritosCount: Number(row.inscritos_count ?? 0),
    aulaId: row.aula_id ?? null,
    aulaCodigo: row.aula_codigo ?? null,
    aulaNombre: row.aula_nombre ?? null,
    horarios,
    horariosEtiqueta: row.horarios_etiqueta ?? null,
  };
}

/**
 * Fila de horario de grupo (vista 154) → `{horarioId, etiqueta}`.
 * @param {Object} row
 * @returns {{horarioId: number, etiqueta: string}}
 */
export function horarioRowToPresentation(row) {
  return { horarioId: row.horario_id, etiqueta: row.bloque_etiqueta };
}

/**
 * Clase mapper para GrupoCapacitacion (patrón del módulo)
 */
export class GrupoCapacitacionMapper {
  static rowToPresentation(row, horarios) {
    return rowToPresentation(row, horarios);
  }

  static horarioRowToPresentation(row) {
    return horarioRowToPresentation(row);
  }
}
