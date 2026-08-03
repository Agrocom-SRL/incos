/**
 * Códigos de permiso · Avance académico (ítem de Académico · ACA-AVANCE). Seed 59.
 * @see docs/plan/reportes-rep-diagnostico.md · docs/referencia/matriz-permisos-sistema.md
 *
 * Una página con dos pestañas gateadas por permiso (disolución del módulo REP):
 *   - Avance (`academico.avance`, LISTAR/EXPORTAR): estudiante × plan con % de
 *     avance; el rol ESTUDIANTE la ve acotada a su propia fila ("Mi avance",
 *     alcance resuelto en servidor).
 *   - Deserción (`academico.desercion`, LISTAR/EXPORTAR, RECTOR/DIR_ACADEMICO):
 *     métrica institucional ANUAL de abandono (ABANDONO/RETIRADO).
 */

export const AVANCE_PERMISOS = {
  /** Listado/export del avance académico; gobierna el ítem de menú. */
  avance: 'academico.avance',
  /** Pestaña Deserción (agregado carrera × gestión + detalle de desertores). */
  desercion: 'academico.desercion',
};
