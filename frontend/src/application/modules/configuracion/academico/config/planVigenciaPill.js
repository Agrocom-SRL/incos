/**
 * Pill de vigencia del plan de estudio (ficha-hub). Reutiliza las clases
 * `cfg-materia-pill--*` ya definidas en `styles/components/atoms/table-cells.css`
 * (misma fuente visual que `materiaTipoPill.js`) — sin CSS nuevo.
 */

export const getPlanVigenciaLabel = (vigente) => (vigente ? 'Vigente' : 'Borrador');

export const getPlanVigenciaPillClass = (vigente) =>
  vigente ? 'cfg-materia-pill cfg-materia-pill--activa' : 'cfg-materia-pill cfg-materia-pill--default';

/**
 * Estado de registro del plan (`activo`, distinto de `vigente`). Concordancia
 * masculina ("plan") — no reutilizar `getMateriaEstadoLabel` (femenino, "materia").
 */
export const getPlanActivoLabel = (activo) => (activo !== false ? 'Activo' : 'Inactivo');

export const getPlanActivoPillClass = (activo) =>
  activo !== false ? 'cfg-materia-pill cfg-materia-pill--activa' : 'cfg-materia-pill cfg-materia-pill--inactiva';
